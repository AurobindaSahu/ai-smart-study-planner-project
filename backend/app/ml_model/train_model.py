import numpy as np
from sklearn.neural_network import MLPRegressor
import joblib
import os

def train_and_save():
    print("🧠 Training ML Model...")

    X_train = np.array([[1/30, 5/5], [1/30, 1/5], [20/30, 5/5], [10/30, 3/5], [30/30, 1/5]])
    y_train = np.array([[0.9, 0.7], [0.4, 0.3], [0.2, 0.5], [0.35, 0.4], [0.05, 0.2]])

    model = MLPRegressor(hidden_layer_sizes=(5,), max_iter=2000, random_state=42)
    model.fit(X_train, y_train)
    
    model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
    joblib.dump(model, model_path)
    print(f"✅ Model trained and saved to {model_path}")

if __name__ == "__main__":
    train_and_save()