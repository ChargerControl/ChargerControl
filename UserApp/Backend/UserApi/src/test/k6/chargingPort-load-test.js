import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Test configuration
export const options = {
    scenarios: {
        // Smoke test - just to verify the API works
        smoke_test: {
            executor: 'constant-vus',
            vus: 1,
            duration: '1m',
            tags: { test_type: 'smoke' },
        },
        // Load test - normal expected load
        normal_load: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 50 },  // Ramp up to 50 users
                { duration: '5m', target: 50 },  // Stay at 50 users
                { duration: '2m', target: 0 },   // Ramp down to 0
            ],
            gracefulRampDown: '30s',
            tags: { test_type: 'load' },
        },
        // Stress test - find the breaking point
        stress_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '2m', target: 100 },  // Ramp up to 100 users
                { duration: '5m', target: 100 },  // Stay at 100 users
                { duration: '2m', target: 200 },  // Ramp up to 200 users
                { duration: '5m', target: 200 },  // Stay at 200 users
                { duration: '2m', target: 0 },    // Ramp down to 0
            ],
            gracefulRampDown: '30s',
            tags: { test_type: 'stress' },
        },
        // Spike test - sudden surge of users
        spike_test: {
            executor: 'ramping-vus',
            startVUs: 0,
            stages: [
                { duration: '10s', target: 500 },  // Quick ramp up
                { duration: '1m', target: 500 },   // Stay at peak
                { duration: '10s', target: 0 },    // Quick ramp down
            ],
            gracefulRampDown: '30s',
            tags: { test_type: 'spike' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
        http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    },
};

const CHARGING_PORTS_BASE_URL = 'http://localhost:8080/apiV1/chargingports'; // Replace with your actual base URL
const TEST_STATION_ID = 1; // Replace with a valid station ID that exists in your system
const TEST_STATUS = "AVAILABLE"; // Replace with a valid ChargingPortStatus value if needed

// Helper to generate random charging port data
function generateRandomChargingPort() {
    const randomId = randomString(6);
    const statuses = ["AVAILABLE", "OCCUPIED", "FAULTED", "MAINTENANCE"]; // Example statuses
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    return {
        portIdentifier: `PORT-${randomId}`,
        status: randomStatus,
        energyUsed: parseFloat((Math.random() * 100).toFixed(2)) // Random energy used
    };
}

// Main test function
export default function () {
    let portId = null; // Variable to store the created charging port ID

    // --- Test Case: Create a new charging port for a station ---
    const newPortPayload = generateRandomChargingPort();
    const createPortRes = http.post(`${CHARGING_PORTS_BASE_URL}/station/${TEST_STATION_ID}`, JSON.stringify(newPortPayload), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(createPortRes, {
        'POST /chargingports/station/{stationId} status is 201': (r) => r.status === 201,
        'POST /chargingports/station/{stationId} response body contains id': (r) => {
            try {
                const body = JSON.parse(r.body);
                if (body.id !== undefined) {
                    portId = body.id; // Capture the portId
                    return true;
                }
                return false;
            } catch (e) {
                return false; // Handle potential JSON parsing errors
            }
        },
        'POST /chargingports/station/{stationId} response body contains portIdentifier': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.portIdentifier === newPortPayload.portIdentifier;
            } catch (e) {
                return false;
            }
        },
    });

    sleep(1);

    // --- Test Case: Get all charging ports for a station ---
    const getPortsByStationRes = http.get(`${CHARGING_PORTS_BASE_URL}/station/${TEST_STATION_ID}`);
    check(getPortsByStationRes, {
        'GET /chargingports/station/{stationId} status is 200': (r) => r.status === 200,
        'GET /chargingports/station/{stationId} response is array': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body));
            } catch (e) {
                return false;
            }
        },
    });
    sleep(1);

    // --- Test Case: Get all charging ports by status ---
    const getPortsByStatusRes = http.get(`${CHARGING_PORTS_BASE_URL}/status/${TEST_STATUS}`);
    check(getPortsByStatusRes, {
        'GET /chargingports/status/{status} status is 200': (r) => r.status === 200,
        'GET /chargingports/status/{status} response is array': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body));
            } catch (e) {
                return false;
            }
        },
    });
    sleep(1);

    // --- Test Case: Get total energy used by all charging ports for a station ---
    const getTotalEnergyRes = http.get(`${CHARGING_PORTS_BASE_URL}/station/${TEST_STATION_ID}/stats/energy`);
    check(getTotalEnergyRes, {
        'GET /chargingports/station/{stationId}/stats/energy status is 200': (r) => r.status === 200,
        'GET /chargingports/station/{stationId}/stats/energy response body contains totalEnergyUsed': (r) => {
            try {
                const body = JSON.parse(r.body);
                return body.hasOwnProperty('totalEnergyUsed') && typeof body.totalEnergyUsed === 'number';
            } catch (e) {
                return false;
            }
        },
    });
    sleep(1);

    // --- Test Case: Delete a charging port by its ID (if a port was created) ---
    if (portId !== null) {
        const deletePortRes = http.del(`${CHARGING_PORTS_BASE_URL}/${portId}`);
        check(deletePortRes, {
            'DELETE /chargingports/{portId} status is 204': (r) => r.status === 204,
        });
        sleep(1);
    } else {
        console.error(`VU ${__VU}: Could not obtain portId after creation, skipping DELETE test.`);
    }

    // Add more test cases or variations as needed
}
