from flask import Flask, jsonify, request, send_file
import pandas as pd
import joblib
from flask_cors import CORS
import io
from utils import encode_features, filter_leads

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend connection

# Load leads data
df = pd.read_csv("leads.csv")

# Load ML model
model = joblib.load("model.pkl")

# Pre-encode full dataset for API speed
df_encoded, encoders = encode_features(df)

@app.route("/api/leads", methods=["GET"])
def get_leads():
    # Extract filter query params
    industry = request.args.get("industry")
    role = request.args.get("role")
    location = request.args.get("location")
    min_score = request.args.get("min_score", type=float, default=0.0)

    # Filter raw df by text filters first
    filtered = filter_leads(df, industry, role, location)

    if filtered.empty:
        return jsonify([])

    # Encode filtered leads for prediction
    filtered_encoded, _ = encode_features(filtered, encoders)

    # Predict lead quality scores
    X_pred = filtered_encoded[["Company", "Industry", "Role", "Location", "CompanySize", "PastInteractionScore"]]
    filtered["PredictedScore"] = model.predict_proba(X_pred)[:, 1]

    # Filter again by minimum predicted score
    filtered = filter_leads(filtered, min_score=min_score)

    # Convert DataFrame to dict and return JSON
    leads = filtered.to_dict(orient="records")

    return jsonify(leads)

@app.route("/api/export", methods=["GET"])
def export_leads():
    min_score = request.args.get("min_score", type=float, default=0.0)

    filtered = df.copy()
    filtered_encoded, _ = encode_features(filtered, encoders)

    X_pred = filtered_encoded[["Company", "Industry", "Role", "Location", "CompanySize", "PastInteractionScore"]]
    filtered["PredictedScore"] = model.predict_proba(X_pred)[:, 1]

    filtered = filter_leads(filtered, min_score=min_score)

    # Prepare CSV in-memory
    output = io.StringIO()
    filtered.to_csv(output, index=False)
    output.seek(0)

    return send_file(
        io.BytesIO(output.getvalue().encode()),
        mimetype="text/csv",
        as_attachment=True,
        download_name="filtered_leads.csv"
    )

if __name__ == "__main__":
    app.run(debug=True)
