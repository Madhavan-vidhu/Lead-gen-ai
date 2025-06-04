import pandas as pd
from sklearn.preprocessing import LabelEncoder

def encode_features(df, encoders=None):
    """
    Encode categorical columns in df with LabelEncoders.
    If encoders dict provided, use those to transform.
    Returns encoded DataFrame and encoders dict.
    """
    df_copy = df.copy()
    categorical_cols = ["Company", "Industry", "Role", "Location"]

    if encoders is None:
        encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            df_copy[col] = le.fit_transform(df_copy[col])
            encoders[col] = le
    else:
        for col in categorical_cols:
            le = encoders[col]
            df_copy[col] = df_copy[col].apply(lambda x: le.transform([x])[0] if x in le.classes_ else -1)
    return df_copy, encoders


def filter_leads(df, industry=None, role=None, location=None, min_score=0.0):
    """
    Filter leads DataFrame by industry, role, location substring matches
    and min predicted score.
    """
    filtered = df.copy()

    if industry:
        filtered = filtered[filtered["Industry"].str.contains(industry, case=False, na=False)]
    if role:
        filtered = filtered[filtered["Role"].str.contains(role, case=False, na=False)]
    if location:
        filtered = filtered[filtered["Location"].str.contains(location, case=False, na=False)]

    # Filter by min_score if column exists
    if "PredictedScore" in filtered.columns:
        filtered = filtered[filtered["PredictedScore"] >= min_score]

    return filtered
