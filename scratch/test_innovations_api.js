const path = require('path');
const workspaceRoot = 'c:/Users/Rakshit Mishra/Downloads/KrishiSeva AG';
const express = require(path.join(workspaceRoot, 'node_modules/express'));
const jwt = require(path.join(workspaceRoot, 'node_modules/jsonwebtoken'));

async function runTests() {
  console.log('Testing 10 Innovations API Endpoints...');
  const app = express();
  app.use(express.json());

  const innovationsRoutes = require(path.join(workspaceRoot, 'apps/backend/dist/routes/innovations.routes.js')).default;
  app.use('/api/innovations', innovationsRoutes);

  const server = app.listen(0);
  const port = server.address().port;
  const baseUrl = 'http://127.0.0.1:' + port;

  const validToken = jwt.sign(
    { id: 'test-farmer-1', phone: '9876543210', name: 'Gurpreet Singh', role: 'farmer' },
    'krishiseva_secure_secret_key_change_in_production',
    { expiresIn: '1h' }
  );
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + validToken,
  };

  const tests = [
    {
      name: '1. Satellite Remote Sensing & SAR Cap',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/satellite/verify/test-farmer-1', { headers: authHeaders });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.spectral_metrics.ndvi === 0.74 };
      }
    },
    {
      name: '2. Cryptographic IoT Weighbridge Zero-Trust',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/weighbridge/telemetry', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ raw_stream: 'ST,GS,+004920kg' })
        });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.zero_trust_security.hmac_sha256_signature.length === 64 };
      }
    },
    {
      name: '3. Dialect Voice-IVR Simulation',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/voice-ivr/simulate-call', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ dialect: 'malwai_punjabi' })
        });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.detected_dialect === 'malwai_punjabi' };
      }
    },
    {
      name: '4. e-NWR Warehouse Pawn & Micro-Pledge Advance',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/warehouse/apply-advance', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ bags_count: 100 })
        });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.pledge_credit_advance.approved_advance_amount > 0 };
      }
    },
    {
      name: '5. Hyperlocal Tractor Freight Pooling',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/freight/pools');
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && Array.isArray(body) && body.length > 0 };
      }
    },
    {
      name: '6. Parali Stubble Carbon Credit Market',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/carbon/wallet', { headers: authHeaders });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.krishi_green_coins > 0 };
      }
    },
    {
      name: '7. Doppler Radar Mandi Storm Shield',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/storm-shield/radar');
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.squall_line_detected === true };
      }
    },
    {
      name: '8. Jan-Samvaad Zero-Trace Whistleblower',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/whistleblower/submit', {
          method: 'POST',
          headers: authHeaders,
          body: JSON.stringify({ category: 'Illegal Katoti' })
        });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.private_access_passkey.length === 16 };
      }
    },
    {
      name: '9. IoT Micro-Silo Spoilage Early Warning Node',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/silo/telemetry/test-farmer-1', { headers: authHeaders });
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body.probes.co2_respiration_ppm > 0 };
      }
    },
    {
      name: '10. Community Drone-as-a-Service (DaaS)',
      fn: async () => {
        const res = await fetch(baseUrl + '/api/innovations/drone/pilots');
        const body = await res.json();
        return { status: res.status, body, pass: res.status === 200 && body[0].rating >= 4.5 };
      }
    },
  ];

  let passed = 0;
  for (const t of tests) {
    try {
      const outcome = await t.fn();
      if (outcome.pass) {
        console.log('PASS: ' + t.name);
        passed++;
      } else {
        console.error('FAIL: ' + t.name + ' (Status: ' + outcome.status + ', body: ' + JSON.stringify(outcome.body) + ')');
      }
    } catch (err) {
      console.error('ERROR: ' + t.name, err.message);
    }
  }

  server.close();
  console.log('\nCompleted: ' + passed + '/' + tests.length + ' tests passed.');
}

runTests();
