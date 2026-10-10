
from pathlib import Path

import joblib
import pandas as pd
from flask import Flask, jsonify, request
from flask_cors import CORS

# 1. Create Flask application
app = Flask(__name__)
CORS(app)

# 2. Load the saved machine learning model
BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "breast_cancer_model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

# 3. Get the exact feature names used during model training
if not hasattr(model, "feature_names_in_"):
    raise ValueError(
        "The model has no saved feature names. "
        "Check how the model was trained."
    )

FEATURES = list(model.feature_names_in_)


# 4. Home route
@app.route("/")
def home():
    return jsonify({
        "message": "BreastIQ Flask API is running",
        "status": "success"
    })


# 5. Check model status and provide feature names
@app.route("/model-status", methods=["GET"])
def model_status():
    return jsonify({
        "status": "success",
        "message": "ML model loaded successfully",
        "number_of_features": len(FEATURES),
        "features": FEATURES
    })


# 6. Provide feature names to the frontend
@app.route("/features", methods=["GET"])
def get_features():
    return jsonify({
        "features": FEATURES,
        "count": len(FEATURES)
    })


# 7. Receive input values and predict
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Please send valid JSON data."
        }), 400

    values = data.get("features")

    if not isinstance(values, dict):
        return jsonify({
            "error": "A features object is required."
        }), 400

    missing = [
        name for name in FEATURES
        if name not in values or values[name] is None
        or str(values[name]).strip() == ""
    ]

    if missing:
        return jsonify({
            "error": "Some feature values are missing.",
            "missing_features": missing
        }), 400

    try:
        row = [float(values[name]) for name in FEATURES]

        if not all(pd.notna(value) for value in row):
            raise ValueError("Values must be finite numbers.")

        if not all(
            abs(value) != float("inf") for value in row
        ):
            raise ValueError("Values must be finite numbers.")

        input_data = pd.DataFrame(
            [row],
            columns=FEATURES
        )

        prediction = int(model.predict(input_data)[0])

        result = "Malignant" if prediction == 1 else "Benign"

        return jsonify({
            "prediction": prediction,
            "result": result,
            "note": (
                "Educational demonstration only. "
                "This result is not a medical diagnosis."
            )
        })

    except (TypeError, ValueError, OverflowError):
        return jsonify({
            "error": "Every feature must contain a valid finite number."
        }), 400

    except Exception:
        app.logger.exception("Prediction failed")
        return jsonify({
            "error": "Prediction failed. Check the Flask terminal."
        }), 500


# 8. Start the server
if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )