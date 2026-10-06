"""
Q-UPI Sentinel: Classical Model Baselines (FR-4 & Section 8)
Implements:
1. Logistic Regression
2. Random Forest Classifier
3. Gradient Boosting Classifier (Stage 1 Backbone)
4. RBF Kernel Support Vector Classifier
"""

from sklearn.ensemble import GradientBoostingClassifier, RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import average_precision_score, f1_score, precision_recall_curve
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC


class ClassicalBaselines:
    def __init__(self, seed: int = 42):
        self.seed = seed
        self.scaler = StandardScaler()
        self.models = {
            "LogisticRegression": LogisticRegression(class_weight="balanced", random_state=seed, max_iter=500),
            "RandomForest": RandomForestClassifier(n_estimators=100, class_weight="balanced", random_state=seed),
            "GradientBoosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, random_state=seed),
            "RBF-SVM": SVC(kernel="rbf", probability=True, class_weight="balanced", random_state=seed)
        }
        self.trained_models = {}

    def fit_all(self, X_train, y_train):
        """Fit scaler and all classical baseline models."""
        X_scaled = self.scaler.fit_transform(X_train)
        for name, model in self.models.items():
            model.fit(X_scaled, y_train)
            self.trained_models[name] = model

    def evaluate_all(self, X_test, y_test) -> dict:
        """Evaluate models and return PR-AUC and F1 scores."""
        X_scaled = self.scaler.transform(X_test)
        results = {}
        for name, model in self.trained_models.items():
            probs = model.predict_proba(X_scaled)[:, 1]
            pr_auc = average_precision_score(y_test, probs)
            preds = (probs > 0.5).astype(int)
            f1 = f1_score(y_test, preds)
            results[name] = {
                "pr_auc": round(float(pr_auc), 4),
                "f1_score": round(float(f1), 4),
                "probabilities": probs
            }
        return results
