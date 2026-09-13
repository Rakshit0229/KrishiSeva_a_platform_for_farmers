const path = require('path');
const workspaceRoot = 'c:/Users/Rakshit Mishra/Downloads/KrishiSeva AG';

// First compile backend to dist
console.log('Testing ML Inference Engine...');

async function testInference() {
  const ml = require(path.join(workspaceRoot, 'apps/backend/dist/services/mlInference.js'));
  console.log('Model registry metrics:', ml.getModelRegistryMetrics());

  // Test Crop Scanner
  const cropTest = ml.predictCropQuality({ crop_type: 'wheat', ambient_temp: 32, ambient_rh: 55 });
  console.log('1. Crop Quality Prediction:', cropTest);

  // Test Mandi Dispatch
  const dispatchTest = ml.recommendMandiDispatch({ day_of_week: 4, arrival_hour: 10, distance_km: 12, payload_qtl: 40, rain_prob: 5, active_counters: 4 });
  console.log('2. Mandi Dispatch Recommendation:', dispatchTest);

  // Test Crop Rotation
  const rotationTest = ml.recommendCropRotation({ soil_n: 160, soil_p: 22, soil_k: 240, soil_ph: 7.1, org_carbon: 0.5, curr_crop: 0 });
  console.log('3. Crop Rotation Recommendation:', rotationTest);

  // Test Silo Spoilage
  const siloTest = ml.predictSiloSpoilage({ core_temp_c: 29, grain_moisture_pct: 12.2, rh_pct: 65, co2_ppm: 820, storage_days: 45 });
  console.log('4. Silo Spoilage Prediction:', siloTest);

  // Test Demand Forecast
  const demandTest = ml.forecastMandiDemand({ rolling_7d_qtl: 1800, harvest_day_idx: 18, rain_forecast_pct: 10, msp_premium: 240 });
  console.log('5. Mandi Demand Forecast:', demandTest);
}

testInference().catch(console.error);
