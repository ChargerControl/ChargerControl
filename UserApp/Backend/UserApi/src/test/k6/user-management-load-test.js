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
            tags: { test_type: 'spike' },
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
        http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
    },
};

const BASE_URL = 'http://localhost:8080/apiV1/user';

// Helper to generate random user data
function generateRandomUser() {
    const randomId = randomString(8);
    return {
        name: `Test User ${randomId}`,
        email: `testuser${randomId}@example.com`,
        password: `password${randomId}`
    };
}

// Main test function
export default function () {
    const user = generateRandomUser();

    // Registration Test
    const registrationRes = http.post(`${BASE_URL}/register`, JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(registrationRes, {
        'registration status is 200': (r) => r.status === 200,
        'registration has jwt token': (r) => JSON.parse(r.body).jwt !== undefined,
    });

    sleep(1);

    // Login Test
    const loginData = {
        email: user.email,
        password: user.password
    };

    const loginRes = http.post(`${BASE_URL}/login`, JSON.stringify(loginData), {
        headers: { 'Content-Type': 'application/json' },
    });

    check(loginRes, {
        'login status is 200': (r) => r.status === 200,
        'login has jwt token': (r) => JSON.parse(r.body).jwt !== undefined,
    });

    sleep(1);
}
