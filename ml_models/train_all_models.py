"""
KrishiSeva ML Training Suite
Trains 5 high-accuracy agricultural models using NumPy:
1. Crop Quality & Moisture Vision Scanner (Multi-output MLP Regressor & Classifier)
2. Mandi Dispatch & Congestion Recommender (Neural Queue Regressor)
3. Crop Rotation & Soil N-P-K Profit Maximizer (Multi-class Rotation & Yield Network)
4. Micro-Silo Grain Spoilage & Infestation Hazard Model (Hazard Probability & Time Network)
5. Mandi Arrival & Demand Forecaster (Time-Series Autoregressive Predictor)
"""

import os
import json
import time
import numpy as np

# Set random seed for reproducibility
np.random.seed(42)

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "trained_weights")
os.makedirs(OUTPUT_DIR, exist_ok=True)

class NeuralNetwork:
    """Multi-Layer Perceptron with Adam Optimizer and Matrix Operations"""
    def __init__(self, layer_sizes, activations=None, task="regression"):
        self.layer_sizes = layer_sizes
        self.task = task
        self.activations = activations or ["relu"] * (len(layer_sizes) - 2) + ["linear" if task == "regression" else "softmax"]
        self.weights = []
        self.biases = []

        # He / Xavier Initialization
        for i in range(len(layer_sizes) - 1):
            n_in, n_out = layer_sizes[i], layer_sizes[i + 1]
            scale = np.sqrt(2.0 / n_in) if self.activations[i] == "relu" else np.sqrt(1.0 / n_in)
            self.weights.append(np.random.randn(n_in, n_out) * scale)
            self.biases.append(np.zeros((1, n_out)))

    def _activate(self, z, act_type):
        if act_type == "relu":
            return np.maximum(0, z)
        elif act_type == "sigmoid":
            return 1.0 / (1.0 + np.exp(-np.clip(z, -15, 15)))
        elif act_type == "softmax":
            exp_z = np.exp(z - np.max(z, axis=1, keepdims=True))
            return exp_z / np.sum(exp_z, axis=1, keepdims=True)
        return z  # linear

    def _activate_grad(self, a, act_type):
        if act_type == "relu":
            return (a > 0).astype(float)
        elif act_type == "sigmoid":
            return a * (1.0 - a)
        return np.ones_like(a)

    def forward(self, X):
        a = X
        activations = [a]
        for w, b, act in zip(self.weights, self.biases, self.activations):
            z = np.dot(a, w) + b
            a = self._activate(z, act)
            activations.append(a)
        return activations

    def train(self, X, y, epochs=150, lr=0.005, batch_size=64, weight_decay=1e-4):
        n_samples = X.shape[0]
        m_w = [np.zeros_like(w) for w in self.weights]
        v_w = [np.zeros_like(w) for w in self.weights]
        m_b = [np.zeros_like(b) for b in self.biases]
        v_b = [np.zeros_like(b) for b in self.biases]
        beta1, beta2, eps = 0.9, 0.999, 1e-8
        t = 0

        history = []
        for epoch in range(epochs):
            indices = np.random.permutation(n_samples)
            X_shuffled = X[indices]
            y_shuffled = y[indices]

            epoch_loss = 0.0
            num_batches = int(np.ceil(n_samples / batch_size))

            for b in range(num_batches):
                t += 1
                start = b * batch_size
                end = min(start + batch_size, n_samples)
                xb = X_shuffled[start:end]
                yb = y_shuffled[start:end]

                # Forward
                acts = self.forward(xb)
                out = acts[-1]

                # Loss & Delta
                if self.task == "regression":
                    loss = np.mean((out - yb) ** 2)
                    delta = 2 * (out - yb) / xb.shape[0]
                else:  # softmax classification
                    loss = -np.mean(np.sum(yb * np.log(out + 1e-12), axis=1))
                    delta = (out - yb) / xb.shape[0]

                epoch_loss += loss

                # Backprop
                grad_w = []
                grad_b = []
                for i in reversed(range(len(self.weights))):
                    a_prev = acts[i]
                    gw = np.dot(a_prev.T, delta) + weight_decay * self.weights[i]
                    gb = np.sum(delta, axis=0, keepdims=True)
                    grad_w.insert(0, gw)
                    grad_b.insert(0, gb)

                    if i > 0:
                        delta = np.dot(delta, self.weights[i].T) * self._activate_grad(a_prev, self.activations[i - 1])

                # Adam optimizer update
                for i in range(len(self.weights)):
                    m_w[i] = beta1 * m_w[i] + (1 - beta1) * grad_w[i]
                    v_w[i] = beta2 * v_w[i] + (1 - beta2) * (grad_w[i] ** 2)
                    m_hat = m_w[i] / (1 - beta1 ** t)
                    v_hat = v_w[i] / (1 - beta2 ** t)
                    self.weights[i] -= lr * m_hat / (np.sqrt(v_hat) + eps)

                    m_b[i] = beta1 * m_b[i] + (1 - beta1) * grad_b[i]
                    v_b[i] = beta2 * v_b[i] + (1 - beta2) * (grad_b[i] ** 2)
                    mb_hat = m_b[i] / (1 - beta1 ** t)
                    vb_hat = v_b[i] / (1 - beta2 ** t)
                    self.biases[i] -= lr * mb_hat / (np.sqrt(vb_hat) + eps)

            epoch_loss /= num_batches
            history.append(float(epoch_loss))

        return history

    def to_dict(self):
        return {
            "layer_sizes": self.layer_sizes,
            "activations": self.activations,
            "task": self.task,
            "weights": [w.tolist() for w in self.weights],
            "biases": [b.tolist() for b in self.biases],
        }

# ============================================================================
# 1. TRAIN MODEL 1: CROP QUALITY & MOISTURE VISION SCANNER
# ============================================================================
def train_crop_scanner():
    print("--- 1. Training Crop Quality & Moisture Vision Scanner ---")
    N = 5500
    crops = np.random.choice([0, 1, 2, 3, 4], size=N)
    
    luminance = np.random.uniform(0.3, 0.9, size=N)
    red_ratio = np.random.uniform(0.25, 0.65, size=N)
    green_ratio = np.random.uniform(0.20, 0.55, size=N)
    texture_roughness = np.random.uniform(0.1, 0.8, size=N)
    grain_compactness = np.random.uniform(0.6, 0.95, size=N)
    ambient_temp = np.random.uniform(22.0, 42.0, size=N)
    ambient_rh = np.random.uniform(35.0, 85.0, size=N)

    crop_onehot = np.zeros((N, 5))
    crop_onehot[np.arange(N), crops] = 1.0

    base_moistures = {0: 11.5, 1: 15.5, 2: 7.5, 3: 10.5, 4: 13.0}
    crop_base = np.array([base_moistures[c] for c in crops])
    
    true_moisture = (
        crop_base
        + 0.05 * (ambient_rh - 50.0)
        - 0.04 * (ambient_temp - 30.0)
        + 3.5 * (green_ratio - 0.35)
        - 2.0 * (luminance - 0.6)
        + np.random.normal(0, 0.35, size=N)
    )
    true_moisture = np.clip(true_moisture, 5.0, 26.0)

    foreign_matter = (
        0.4
        + 1.8 * texture_roughness
        - 0.8 * (grain_compactness - 0.7)
        + np.random.normal(0, 0.1, size=N)
    )
    foreign_matter = np.clip(foreign_matter, 0.1, 4.5)

    broken_grains = (
        0.5
        + 2.5 * (1.0 - grain_compactness)
        + 0.05 * (ambient_temp - 25.0)
        + np.random.normal(0, 0.15, size=N)
    )
    broken_grains = np.clip(broken_grains, 0.2, 5.0)

    thresholds = {0: 12.0, 1: 17.0, 2: 8.0, 3: 13.0, 4: 14.0}
    max_perm = np.array([thresholds[c] for c in crops])
    excess_moisture = np.maximum(0, true_moisture - max_perm)
    deduction_risk = excess_moisture * 65.0 + np.maximum(0, foreign_matter - 1.0) * 40.0

    X = np.column_stack([crop_onehot, luminance, red_ratio, green_ratio, texture_roughness, grain_compactness, ambient_temp, ambient_rh])
    y = np.column_stack([true_moisture, foreign_matter, broken_grains, deduction_risk])

    x_mean = np.mean(X, axis=0)
    x_std = np.std(X, axis=0) + 1e-8
    X_norm = (X - x_mean) / x_std

    y_mean = np.mean(y, axis=0)
    y_std = np.std(y, axis=0) + 1e-8
    y_norm = (y - y_mean) / y_std

    split = int(0.85 * N)
    X_train, X_val = X_norm[:split], X_norm[split:]
    y_train, y_val = y_norm[:split], y_norm[split:]

    model = NeuralNetwork([12, 32, 16, 4], ["relu", "relu", "linear"], task="regression")
    loss_history = model.train(X_train, y_train, epochs=200, lr=0.008, batch_size=64)

    val_preds_norm = model.forward(X_val)[-1]
    val_preds = val_preds_norm * y_std + y_mean
    val_true = y[split:]
    r2_moisture = 1 - (np.sum((val_true[:, 0] - val_preds[:, 0])**2) / np.sum((val_true[:, 0] - np.mean(val_true[:, 0]))**2))
    rmse_moisture = np.sqrt(np.mean((val_true[:, 0] - val_preds[:, 0])**2))

    print(f"[OK] Crop Scanner trained: Final Loss={loss_history[-1]:.4f}, Moisture R2={r2_moisture:.4f}, RMSE={rmse_moisture:.2f}%")

    export_data = {
        "model_name": "crop_quality_scanner",
        "version": "2.1.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_samples": N,
        "metrics": {"r2_moisture": float(r2_moisture), "rmse_moisture": float(rmse_moisture), "final_loss": float(loss_history[-1])},
        "scaler": {"x_mean": x_mean.tolist(), "x_std": x_std.tolist(), "y_mean": y_mean.tolist(), "y_std": y_std.tolist()},
        "feature_names": ["crop_wheat", "crop_paddy", "crop_mustard", "crop_gram", "crop_maize", "luminance", "red_ratio", "green_ratio", "texture_roughness", "grain_compactness", "ambient_temp", "ambient_rh"],
        "target_names": ["moisture_pct", "foreign_matter_pct", "broken_grains_pct", "deduction_risk_inr"],
        "network": model.to_dict(),
    }

    with open(os.path.join(OUTPUT_DIR, "crop_quality_scanner.json"), "w") as f:
        json.dump(export_data, f, indent=2)

# ============================================================================
# 2. TRAIN MODEL 2: MANDI DISPATCH & CONGESTION RECOMMENDER
# ============================================================================
def train_dispatch_recommender():
    print("--- 2. Training Mandi Dispatch & Congestion Recommender ---")
    N = 6000

    day_of_week = np.random.randint(0, 7, size=N)
    arrival_hour = np.random.uniform(6.0, 18.0, size=N)
    distance_km = np.random.uniform(2.0, 45.0, size=N)
    payload_qtl = np.random.uniform(15.0, 120.0, size=N)
    rain_prob = np.random.uniform(0.0, 100.0, size=N)
    active_counters = np.random.randint(1, 7, size=N)

    hour_penalty = np.exp(-0.5 * ((arrival_hour - 13.0) / 2.5) ** 2) * 50.0
    day_penalty = np.where((day_of_week == 0) | (day_of_week == 4), 25.0, 5.0)
    rain_disruption = (rain_prob > 60.0) * 35.0
    counter_relief = 40.0 / active_counters

    wait_time_mins = (
        12.0
        + hour_penalty
        + day_penalty
        + rain_disruption
        + counter_relief
        + 0.15 * payload_qtl
        + np.random.normal(0, 3.5, size=N)
    )
    wait_time_mins = np.clip(wait_time_mins, 8.0, 180.0)
    congestion_score = np.clip(wait_time_mins / 1.5, 5.0, 99.0)
    idling_fuel_cost = (wait_time_mins / 60.0) * 165.0

    X = np.column_stack([day_of_week, arrival_hour, distance_km, payload_qtl, rain_prob, active_counters])
    y = np.column_stack([wait_time_mins, congestion_score, idling_fuel_cost])

    x_mean = np.mean(X, axis=0)
    x_std = np.std(X, axis=0) + 1e-8
    X_norm = (X - x_mean) / x_std

    y_mean = np.mean(y, axis=0)
    y_std = np.std(y, axis=0) + 1e-8
    y_norm = (y - y_mean) / y_std

    split = int(0.85 * N)
    X_train, X_val = X_norm[:split], X_norm[split:]
    y_train, y_val = y_norm[:split], y_norm[split:]

    model = NeuralNetwork([6, 24, 16, 3], ["relu", "relu", "linear"], task="regression")
    loss_history = model.train(X_train, y_train, epochs=180, lr=0.006, batch_size=64)

    val_preds = model.forward(X_val)[-1] * y_std + y_mean
    r2_wait = 1 - (np.sum((y[split:, 0] - val_preds[:, 0])**2) / np.sum((y[split:, 0] - np.mean(y[split:, 0]))**2))

    print(f"[OK] Mandi Dispatch Recommender trained: Final Loss={loss_history[-1]:.4f}, Wait Time R2={r2_wait:.4f}")

    export_data = {
        "model_name": "mandi_dispatch_recommender",
        "version": "2.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_samples": N,
        "metrics": {"r2_wait_time": float(r2_wait), "final_loss": float(loss_history[-1])},
        "scaler": {"x_mean": x_mean.tolist(), "x_std": x_std.tolist(), "y_mean": y_mean.tolist(), "y_std": y_std.tolist()},
        "feature_names": ["day_of_week", "arrival_hour", "distance_km", "payload_qtl", "rain_prob", "active_counters"],
        "target_names": ["wait_time_mins", "congestion_score", "idling_fuel_cost_inr"],
        "network": model.to_dict(),
    }

    with open(os.path.join(OUTPUT_DIR, "mandi_dispatch_recommender.json"), "w") as f:
        json.dump(export_data, f, indent=2)

# ============================================================================
# 3. TRAIN MODEL 3: CROP ROTATION & SOIL PROFIT MAXIMIZER
# ============================================================================
def train_crop_rotation_model():
    print("--- 3. Training Crop Rotation & Soil Profit Maximizer ---")
    N = 5000

    soil_n = np.random.uniform(110.0, 340.0, size=N)
    soil_p = np.random.uniform(12.0, 58.0, size=N)
    soil_k = np.random.uniform(120.0, 380.0, size=N)
    soil_ph = np.random.uniform(6.0, 8.5, size=N)
    org_carbon = np.random.uniform(0.25, 1.1, size=N)
    water_table_m = np.random.uniform(6.0, 32.0, size=N)
    curr_crop = np.random.choice([0, 1], size=N)

    rotation_scores = np.zeros((N, 4))
    rotation_scores[:, 0] = (300.0 - soil_n) * 0.4 + (water_table_m - 10.0) * 2.0 + (curr_crop == 0) * 30.0
    rotation_scores[:, 1] = (soil_ph - 6.5) * 15.0 + soil_k * 0.15
    rotation_scores[:, 2] = (0.7 - org_carbon) * 80.0 + (300.0 - soil_n) * 0.2
    rotation_scores[:, 3] = soil_p * 0.8 + soil_k * 0.1 + (curr_crop == 1) * 25.0

    rotation_class = np.argmax(rotation_scores, axis=1)
    y_class_onehot = np.zeros((N, 4))
    y_class_onehot[np.arange(N), rotation_class] = 1.0

    profit_acre = (
        12000.0
        + (rotation_class == 0) * 12500.0
        + (rotation_class == 1) * 8500.0
        + (rotation_class == 3) * 11000.0
        + org_carbon * 4000.0
        + np.random.normal(0, 800.0, size=N)
    )
    n_fixed = np.where((rotation_class == 0) | (rotation_class == 2), np.random.uniform(32.0, 44.0, size=N), 0.0)

    X = np.column_stack([soil_n, soil_p, soil_k, soil_ph, org_carbon, water_table_m, curr_crop])
    y_targets = np.column_stack([profit_acre, n_fixed])

    x_mean = np.mean(X, axis=0)
    x_std = np.std(X, axis=0) + 1e-8
    X_norm = (X - x_mean) / x_std

    y_mean = np.mean(y_targets, axis=0)
    y_std = np.std(y_targets, axis=0) + 1e-8
    y_norm = (y_targets - y_mean) / y_std

    split = int(0.85 * N)
    X_train, X_val = X_norm[:split], X_norm[split:]
    y_train, y_val = y_norm[:split], y_norm[split:]

    reg_model = NeuralNetwork([7, 24, 16, 2], ["relu", "relu", "linear"], task="regression")
    loss_history = reg_model.train(X_train, y_train, epochs=160, lr=0.007, batch_size=64)

    clf_model = NeuralNetwork([7, 20, 4], ["relu", "softmax"], task="classification")
    clf_model.train(X_train, y_class_onehot[:split], epochs=160, lr=0.01, batch_size=64)

    clf_preds = np.argmax(clf_model.forward(X_val)[-1], axis=1)
    acc = np.mean(clf_preds == rotation_class[split:])
    print(f"[OK] Crop Rotation Model trained: Profit Regressor Loss={loss_history[-1]:.4f}, Classifier Accuracy={acc * 100:.2f}%")

    export_data = {
        "model_name": "crop_rotation_recommender",
        "version": "2.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_samples": N,
        "metrics": {"classifier_accuracy_pct": float(acc * 100), "profit_regressor_loss": float(loss_history[-1])},
        "scaler": {"x_mean": x_mean.tolist(), "x_std": x_std.tolist(), "y_mean": y_mean.tolist(), "y_std": y_std.tolist()},
        "feature_names": ["soil_n", "soil_p", "soil_k", "soil_ph", "org_carbon", "water_table_m", "curr_crop"],
        "class_labels": ["Summer Moong / Green Gram", "Sesame (तिल)", "Green Manure (धैंचा)", "Mustard / Toria (तोरिया)"],
        "regressor_network": reg_model.to_dict(),
        "classifier_network": clf_model.to_dict(),
    }

    with open(os.path.join(OUTPUT_DIR, "crop_rotation_recommender.json"), "w") as f:
        json.dump(export_data, f, indent=2)

# ============================================================================
# 4. TRAIN MODEL 4: MICRO-SILO GRAIN SPOILAGE & INFESTATION MODEL
# ============================================================================
def train_silo_spoilage_model():
    print("--- 4. Training Micro-Silo Grain Spoilage & Infestation Model ---")
    N = 5000

    core_temp = np.random.uniform(16.0, 42.0, size=N)
    grain_moisture = np.random.uniform(9.0, 21.0, size=N)
    rh = np.random.uniform(35.0, 92.0, size=N)
    co2_ppm = np.random.uniform(450.0, 3200.0, size=N)
    storage_days = np.random.uniform(3.0, 160.0, size=N)

    biological_activity = (
        0.08 * np.maximum(0, core_temp - 25.0)
        + 0.15 * np.maximum(0, grain_moisture - 13.0)
        + 0.0008 * np.maximum(0, co2_ppm - 800.0)
        + 0.05 * (rh / 100.0)
    )
    
    weevil_prob = 1.0 / (1.0 + np.exp(-3.5 * (biological_activity - 0.7))) * 100.0
    weevil_prob = np.clip(weevil_prob, 0.5, 99.5)

    days_to_spoil = 120.0 / (1.0 + 2.5 * biological_activity) - 0.15 * storage_days
    days_to_spoil = np.clip(days_to_spoil, 3.0, 120.0)

    X = np.column_stack([core_temp, grain_moisture, rh, co2_ppm, storage_days])
    y = np.column_stack([weevil_prob, days_to_spoil])

    x_mean = np.mean(X, axis=0)
    x_std = np.std(X, axis=0) + 1e-8
    X_norm = (X - x_mean) / x_std

    y_mean = np.mean(y, axis=0)
    y_std = np.std(y, axis=0) + 1e-8
    y_norm = (y - y_mean) / y_std

    split = int(0.85 * N)
    X_train, X_val = X_norm[:split], X_norm[split:]
    y_train, y_val = y_norm[:split], y_norm[split:]

    model = NeuralNetwork([5, 20, 16, 2], ["relu", "relu", "linear"], task="regression")
    loss_history = model.train(X_train, y_train, epochs=170, lr=0.007, batch_size=64)

    val_preds = model.forward(X_val)[-1] * y_std + y_mean
    r2_days = 1 - (np.sum((y[split:, 1] - val_preds[:, 1])**2) / np.sum((y[split:, 1] - np.mean(y[split:, 1]))**2))

    print(f"[OK] Silo Spoilage Model trained: Final Loss={loss_history[-1]:.4f}, Safe Horizon R2={r2_days:.4f}")

    export_data = {
        "model_name": "silo_spoilage_predictor",
        "version": "2.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_samples": N,
        "metrics": {"r2_safe_horizon": float(r2_days), "final_loss": float(loss_history[-1])},
        "scaler": {"x_mean": x_mean.tolist(), "x_std": x_std.tolist(), "y_mean": y_mean.tolist(), "y_std": y_std.tolist()},
        "feature_names": ["core_temp_c", "grain_moisture_pct", "rh_pct", "co2_ppm", "storage_days"],
        "target_names": ["weevil_infestation_prob_pct", "safe_storage_days_remaining"],
        "network": model.to_dict(),
    }

    with open(os.path.join(OUTPUT_DIR, "silo_spoilage_predictor.json"), "w") as f:
        json.dump(export_data, f, indent=2)

# ============================================================================
# 5. TRAIN MODEL 5: MANDI ARRIVAL & DEMAND FORECASTER
# ============================================================================
def train_mandi_demand_forecaster():
    print("--- 5. Training Mandi Arrival & Demand Forecaster ---")
    N = 4500

    rolling_7d_qtl = np.random.uniform(150.0, 2800.0, size=N)
    harvest_day_idx = np.random.uniform(1.0, 45.0, size=N)
    rain_forecast = np.random.uniform(0.0, 100.0, size=N)
    msp_premium = np.random.uniform(50.0, 420.0, size=N)

    bell_factor = np.exp(-0.5 * ((harvest_day_idx - 18.0) / 7.0) ** 2)
    next_day_arrivals_qtl = (
        0.65 * rolling_7d_qtl
        + 1200.0 * bell_factor
        + 1.8 * msp_premium
        - 8.5 * rain_forecast
        + np.random.normal(0, 45.0, size=N)
    )
    next_day_arrivals_qtl = np.clip(next_day_arrivals_qtl, 80.0, 4500.0)
    truck_load_count = np.round(next_day_arrivals_qtl / 65.0)
    dbt_lakhs_needed = (next_day_arrivals_qtl * 2275.0) / 100000.0

    X = np.column_stack([rolling_7d_qtl, harvest_day_idx, rain_forecast, msp_premium])
    y = np.column_stack([next_day_arrivals_qtl, truck_load_count, dbt_lakhs_needed])

    x_mean = np.mean(X, axis=0)
    x_std = np.std(X, axis=0) + 1e-8
    X_norm = (X - x_mean) / x_std

    y_mean = np.mean(y, axis=0)
    y_std = np.std(y, axis=0) + 1e-8
    y_norm = (y - y_mean) / y_std

    split = int(0.85 * N)
    X_train, X_val = X_norm[:split], X_norm[split:]
    y_train, y_val = y_norm[:split], y_norm[split:]

    model = NeuralNetwork([4, 20, 16, 3], ["relu", "relu", "linear"], task="regression")
    loss_history = model.train(X_train, y_train, epochs=170, lr=0.007, batch_size=64)

    val_preds = model.forward(X_val)[-1] * y_std + y_mean
    r2_arrivals = 1 - (np.sum((y[split:, 0] - val_preds[:, 0])**2) / np.sum((y[split:, 0] - np.mean(y[split:, 0]))**2))

    print(f"[OK] Mandi Demand Forecaster trained: Final Loss={loss_history[-1]:.4f}, Arrival Volume R2={r2_arrivals:.4f}")

    export_data = {
        "model_name": "mandi_demand_forecaster",
        "version": "2.0.0",
        "trained_at": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_samples": N,
        "metrics": {"r2_arrival_volume": float(r2_arrivals), "final_loss": float(loss_history[-1])},
        "scaler": {"x_mean": x_mean.tolist(), "x_std": x_std.tolist(), "y_mean": y_mean.tolist(), "y_std": y_std.tolist()},
        "feature_names": ["rolling_7d_qtl", "harvest_day_idx", "rain_forecast", "msp_premium"],
        "target_names": ["next_day_arrivals_qtl", "truck_load_count", "dbt_lakhs_needed"],
        "network": model.to_dict(),
    }

    with open(os.path.join(OUTPUT_DIR, "mandi_demand_forecaster.json"), "w") as f:
        json.dump(export_data, f, indent=2)

if __name__ == "__main__":
    t0 = time.time()
    print("=================================================================")
    print("  KRISHISEVA MACHINE LEARNING MODEL TRAINING PIPELINE STARTED   ")
    print("=================================================================")
    train_crop_scanner()
    train_dispatch_recommender()
    train_crop_rotation_model()
    train_silo_spoilage_model()
    train_mandi_demand_forecaster()
    elapsed = time.time() - t0
    print("=================================================================")
    print(f"  ALL 5 AGRICULTURAL MODELS TRAINED & EXPORTED IN {elapsed:.2f}s! ")
    print(f"  Trained weights stored at: {OUTPUT_DIR}")
    print("=================================================================")
