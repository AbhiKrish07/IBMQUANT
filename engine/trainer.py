"""
HilbertShield Training Engine
Implements quantum kernel SVM training with SMOTE for fraud detection
"""
import numpy as np
import joblib
from sklearn.svm import SVC
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from typing import Tuple
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from config import StructuredLogger, DATASET_SIZE, FRAUD_RATE, RANDOM_SEED, MODEL_PATH

logger = StructuredLogger(__name__)


def generate_mock_data() -> Tuple[np.ndarray, np.ndarray]:
    """
    Generate realistic mock transaction data for training.
    
    Creates 10,000 transactions with 0.5% fraud rate.
    Features: Amount, Time, MerchantCategory, DistanceFromHome
    
    Fraud patterns:
    - Higher amounts (log-normal with higher mean)
    - Unusual times (late night/early morning)
    - Specific merchant categories (electronics, jewelry)
    - Greater distances from home
    
    Returns:
        Tuple[np.ndarray, np.ndarray]: Features (X) and labels (y)
    """
    np.random.seed(RANDOM_SEED)
    
    n_samples = DATASET_SIZE
    n_fraud = int(n_samples * FRAUD_RATE)
    n_legitimate = n_samples - n_fraud
    
    logger.info(
        "Generating mock transaction data",
        total_samples=n_samples,
        fraud_samples=n_fraud,
        legitimate_samples=n_legitimate
    )
    
    # Generate legitimate transactions
    legitimate_amount = np.random.lognormal(mean=3.5, sigma=1.2, size=n_legitimate)
    legitimate_time = np.random.uniform(6, 22, size=n_legitimate)  # Daytime hours
    legitimate_merchant = np.random.choice([0, 1, 2, 3, 4, 5], size=n_legitimate, 
                                          p=[0.3, 0.25, 0.2, 0.15, 0.07, 0.03])
    legitimate_distance = np.random.exponential(scale=5, size=n_legitimate)
    
    # Generate fraud transactions with distinguishable patterns
    fraud_amount = np.random.lognormal(mean=6.0, sigma=0.8, size=n_fraud)  # Much higher amounts
    fraud_time = np.concatenate([
        np.random.uniform(0, 3, size=n_fraud//2),  # Late night
        np.random.uniform(23.5, 24, size=n_fraud - n_fraud//2)  # Very late
    ])
    fraud_merchant = np.random.choice([7, 8, 9], size=n_fraud,
                                     p=[0.5, 0.3, 0.2])  # High-risk categories only
    fraud_distance = np.random.exponential(scale=100, size=n_fraud)  # Very far from home
    
    # Combine legitimate and fraud data
    X_legitimate = np.column_stack([
        legitimate_amount,
        legitimate_time,
        legitimate_merchant,
        legitimate_distance
    ])
    
    X_fraud = np.column_stack([
        fraud_amount,
        fraud_time,
        fraud_merchant,
        fraud_distance
    ])
    
    X = np.vstack([X_legitimate, X_fraud])
    y = np.hstack([np.zeros(n_legitimate), np.ones(n_fraud)])
    
    # Shuffle the data
    shuffle_idx = np.random.permutation(n_samples)
    X = X[shuffle_idx]
    y = y[shuffle_idx]
    
    logger.info(
        "Mock data generation complete",
        feature_shape=X.shape,
        fraud_percentage=f"{(y.sum() / len(y)) * 100:.2f}%"
    )
    
    return X, y


def train_model(X: np.ndarray, y: np.ndarray) -> ImbPipeline:
    """
    Train quantum kernel SVM with SMOTE oversampling.
    
    Pipeline:
    1. SMOTE - Oversample minority (fraud) class
    2. StandardScaler - Normalize features
    3. SVC with RBF kernel - Quantum kernel proxy
    
    Args:
        X: Feature matrix (n_samples, 4)
        y: Labels (n_samples,)
    
    Returns:
        ImbPipeline: Trained pipeline
    """
    logger.info("Starting model training", samples=len(X), fraud_count=int(y.sum()))
    
    # Create pipeline with SMOTE and quantum kernel SVM
    pipeline = ImbPipeline([
        ('smote', SMOTE(random_state=RANDOM_SEED, k_neighbors=5, sampling_strategy=0.5)),
        ('scaler', StandardScaler()),
        ('svm', SVC(
            kernel='rbf',           # Radial Basis Function - quantum proxy
            probability=True,       # Enable probability estimates
            gamma=0.1,             # Kernel coefficient
            C=10.0,                # Higher regularization for better separation
            class_weight='balanced', # Handle remaining imbalance
            random_state=RANDOM_SEED
        ))
    ])
    
    # Train the pipeline
    logger.info("Training quantum kernel SVM with SMOTE")
    pipeline.fit(X, y)
    
    # Log training completion
    logger.info(
        "Model training complete",
        kernel="rbf",
        probability_enabled=True
    )
    
    return pipeline


def save_model(pipeline: ImbPipeline, filepath: str = MODEL_PATH) -> None:
    """
    Save trained pipeline to disk using joblib.
    
    Args:
        pipeline: Trained pipeline
        filepath: Path to save model
    """
    logger.info("Saving model", filepath=filepath)
    joblib.dump(pipeline, filepath)
    logger.info("Model saved successfully", filepath=filepath)


def main():
    """Main training workflow"""
    logger.info("HilbertShield Training Started")
    
    # Generate training data
    X, y = generate_mock_data()
    
    # Train model
    pipeline = train_model(X, y)
    
    # Save model
    save_model(pipeline)
    
    logger.info("HilbertShield Training Complete")


if __name__ == "__main__":
    main()
