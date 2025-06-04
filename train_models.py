import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
import joblib

df = pd.read_csv("leads.csv")

# Encode categorical features
for col in ["Company", "Industry", "Role", "Location"]:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])

X = df[["Company", "Industry", "Role", "Location", "CompanySize", "PastInteractionScore"]]
y = df["LeadScore"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=50, random_state=42)
model.fit(X_train, y_train)

print("Model accuracy:", model.score(X_test, y_test))

# Save model and label encoders
joblib.dump(model, "model.pkl")
print("Model saved as model.pkl")
