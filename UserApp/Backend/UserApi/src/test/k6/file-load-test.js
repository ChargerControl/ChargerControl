import http from 'k6/http';
import { check, sleep } from 'k6';

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
            tags: { test_type: 'spike' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
        http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    },
};

const CARS_BASE_URL = 'http://localhost:8080/apiV1/cars'; // Replace with your actual base URL

// Main test function
export default function () {
    // --- Test Case: Get all cars ---
    const getAllCarsRes = http.get(`${CARS_BASE_URL}/all`);

    check(getAllCarsRes, {
        'GET /cars/all status is 200': (r) => r.status === 200,
        'GET /cars/all response is array': (r) => {
            try {
                return Array.isArray(JSON.parse(r.body));
            } catch (e) {
                return false; // Handle potential JSON parsing errors
            }
        },
    });

    sleep(1); // Wait for 1 second before the next iteration
}
