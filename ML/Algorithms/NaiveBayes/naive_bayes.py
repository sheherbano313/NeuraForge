
# Naive Bayes - Breast Cancer Classification

from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    confusion_matrix
)

# 1. Load dataset
data = load_breast_cancer()

X = data.data
y = data.target

print("Dataset shape:", X.shape)
print("Classes:", data.target_names)

# 2. Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)

# 3. Create model
model = GaussianNB()

# 4. Train model
model.fit(X_train, y_train)

# 5. Make predictions
predictions = model.predict(X_test)

# 6. Evaluate model
accuracy = accuracy_score(y_test, predictions)

print("\nAlgorithm: Naive Bayes")
print(f"Accuracy: {accuracy:.4f} ({accuracy * 100:.2f}%)")

print("\nClassification Report:")
print(
    classification_report(
        y_test,
        predictions,
        target_names=data.target_names
    )
)

print("\nConfusion Matrix:")
print(confusion_matrix(y_test, predictions))

# 7. Show probabilities for first 5 samples
probabilities = model.predict_proba(X_test[:5])

print("\nClass probabilities for first 5 samples:")
print(probabilities)

print("\nPredicted classes:")
print(data.target_names[predictions[:5]])