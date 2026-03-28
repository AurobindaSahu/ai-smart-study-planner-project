import joblib
import numpy as np
import os

model_path = os.path.join(os.path.dirname(__file__), 'model.joblib')
try:
    model = joblib.load(model_path)
except FileNotFoundError:
    print("⚠️ Model file not found. Please run train_model.py first!")
    model = None

def get_study_prediction(days: int, difficulty: int):
    if not model:
        raise Exception("ML Model not loaded.")
        
    safe_days = min(days, 30)
    safe_diff = min(difficulty, 5)

    input_data = np.array([[safe_days / 30, safe_diff / 5]])
    prediction = model.predict(input_data)[0]
    
    recommended_hours = round(max(0.1, prediction[0] * 10), 1)
    practice_ratio = max(0.0, min(1.0, prediction[1]))
    
    practice_time = round(recommended_hours * practice_ratio, 1)
    theory_time = round(recommended_hours - practice_time, 1)
    
    return recommended_hours, theory_time, practice_time