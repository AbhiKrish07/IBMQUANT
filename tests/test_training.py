"""
Property-based tests for HilbertShield training pipeline
Feature: hilbert-shield-fraud-detection
"""
import pytest
import numpy as np
from hypothesis import given, strategies as st, settings
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from engine.trainer import generate_mock_data, train_model, save_model
from config import DATASET_SIZE, FRAUD_RATE
import joblib


class TestDataGeneration:
    """Property 8: Training Data Quality"""
    
    def test_data_generation_size(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 8: Training Data Quality
        Validates: Requirements 7.1, 7.2, 7.4
        
        Test that generated data has correct size and fraud rate
        """
        X, y = generate_mock_data()
        
        # Check dataset size
        assert X.shape[0] == DATASET_SIZE, f"Expected {DATASET_SIZE} samples, got {X.shape[0]}"
        assert y.shape[0] == DATASET_SIZE, f"Expected {DATASET_SIZE} labels, got {y.shape[0]}"
        
        # Check feature dimensions
        assert X.shape[1] == 4, f"Expected 4 features, got {X.shape[1]}"
        
        # Check fraud rate (exactly 0.5%)
        fraud_count = np.sum(y)
        expected_fraud = int(DATASET_SIZE * FRAUD_RATE)
        assert fraud_count == expected_fraud, f"Expected {expected_fraud} fraud cases, got {fraud_count}"
        
        # Check fraud percentage
        fraud_percentage = (fraud_count / DATASET_SIZE) * 100
        assert abs(fraud_percentage - 0.5) < 0.01, f"Fraud rate should be 0.5%, got {fraud_percentage:.2f}%"
    
    def test_data_distinguishable_patterns(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 8: Training Data Quality
        Validates: Requirements 7.4
        
        Test that fraud and legitimate transactions have distinguishable patterns
        """
        X, y = generate_mock_data()
        
        # Separate fraud and legitimate transactions
        fraud_mask = y == 1
        legit_mask = y == 0
        
        fraud_transactions = X[fraud_mask]
        legit_transactions = X[legit_mask]
        
        # Check that fraud transactions have different statistical properties
        # Feature 0: Amount - fraud should have higher mean
        fraud_amount_mean = np.mean(fraud_transactions[:, 0])
        legit_amount_mean = np.mean(legit_transactions[:, 0])
        assert fraud_amount_mean > legit_amount_mean, "Fraud amounts should be higher on average"
        
        # Feature 3: Distance - fraud should have higher mean distance
        fraud_distance_mean = np.mean(fraud_transactions[:, 3])
        legit_distance_mean = np.mean(legit_transactions[:, 3])
        assert fraud_distance_mean > legit_distance_mean, "Fraud distances should be higher on average"
        
        # Feature 2: Merchant category - fraud should use different categories
        fraud_merchants = fraud_transactions[:, 2]
        legit_merchants = legit_transactions[:, 2]
        # Fraud should have higher average merchant category (7, 8, 9 vs 0-5)
        assert np.mean(fraud_merchants) > np.mean(legit_merchants), \
            "Fraud should use higher merchant categories on average"
    
    def test_data_realistic_distributions(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 8: Training Data Quality
        Validates: Requirements 7.3
        
        Test that generated data follows realistic distributions
        """
        X, y = generate_mock_data()
        
        # Amount should be positive
        assert np.all(X[:, 0] > 0), "All amounts should be positive"
        
        # Time should be in 0-24 range
        assert np.all(X[:, 1] >= 0) and np.all(X[:, 1] <= 24), "Time should be in 0-24 range"
        
        # Merchant category should be integers 0-9
        assert np.all(X[:, 2] >= 0) and np.all(X[:, 2] <= 9), "Merchant categories should be 0-9"
        assert np.all(X[:, 2] == X[:, 2].astype(int)), "Merchant categories should be integers"
        
        # Distance should be non-negative
        assert np.all(X[:, 3] >= 0), "Distance should be non-negative"


class TestModelTraining:
    """Property tests for model training"""
    
    def test_smote_application(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 6: SMOTE Application
        Validates: Requirements 3.1, 3.2
        
        Test that SMOTE increases fraud samples
        """
        X, y = generate_mock_data()
        
        original_fraud_count = np.sum(y)
        
        # Train model (which applies SMOTE internally)
        pipeline = train_model(X, y)
        
        # SMOTE should have been applied (we can't directly check the resampled data
        # but we can verify the pipeline contains SMOTE)
        assert 'smote' in pipeline.named_steps, "Pipeline should contain SMOTE step"
        
        # Verify model was trained successfully
        assert hasattr(pipeline.named_steps['svm'], 'support_vectors_'), "SVM should be trained"
    
    def test_model_diversity(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 7: Model Diversity
        Validates: Requirements 3.4
        
        Test that model produces diverse risk scores (not just low scores)
        """
        X, y = generate_mock_data()
        pipeline = train_model(X, y)
        
        # Get predictions on training data
        probabilities = pipeline.predict_proba(X)[:, 1]  # Fraud probability
        
        # Check that we have a range of scores
        assert probabilities.min() < 0.5, "Should have some low risk scores"
        assert probabilities.max() > 0.5, "Should have some high risk scores"
        
        # Check that not all predictions are the same
        unique_predictions = len(np.unique(np.round(probabilities, 2)))
        assert unique_predictions > 2, f"Should have diverse predictions, got {unique_predictions} unique values"
        
        # Check that model predicts some fraud cases
        high_risk_count = np.sum(probabilities > 0.5)
        assert high_risk_count > 0, "Model should predict at least some fraud cases"
    
    def test_pipeline_persistence(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 9: Pipeline Persistence
        Validates: Requirements 5.1, 5.3
        
        Test that pipeline is saved correctly with all components
        """
        X, y = generate_mock_data()
        pipeline = train_model(X, y)
        
        # Save model
        test_model_path = "test_model.pkl"
        save_model(pipeline, test_model_path)
        
        # Load model
        loaded_pipeline = joblib.load(test_model_path)
        
        # Verify pipeline components
        assert 'smote' in loaded_pipeline.named_steps, "Loaded pipeline should contain SMOTE"
        assert 'scaler' in loaded_pipeline.named_steps, "Loaded pipeline should contain StandardScaler"
        assert 'svm' in loaded_pipeline.named_steps, "Loaded pipeline should contain SVM"
        
        # Verify predictions match
        original_pred = pipeline.predict_proba(X[:10])
        loaded_pred = loaded_pipeline.predict_proba(X[:10])
        np.testing.assert_array_almost_equal(original_pred, loaded_pred, 
                                            err_msg="Loaded model should produce same predictions")
        
        # Cleanup
        os.remove(test_model_path)
    
    def test_rbf_kernel_behavior(self):
        """
        Feature: hilbert-shield-fraud-detection, Property 10: RBF Kernel Behavior
        Validates: Requirements 2.3
        
        Test that RBF kernel produces different similarity scores for different inputs
        """
        X, y = generate_mock_data()
        pipeline = train_model(X, y)
        
        svm = pipeline.named_steps['svm']
        
        # Verify RBF kernel is used
        assert svm.kernel == 'rbf', "SVM should use RBF kernel"
        
        # Create very different transaction samples
        # Low risk transaction
        low_risk = np.array([[50.0, 14.0, 2, 3.0]])  # Normal amount, daytime, common merchant, close
        # High risk transaction  
        high_risk = np.array([[5000.0, 2.0, 9, 500.0]])  # High amount, night, risky merchant, far
        # Medium transaction
        medium = np.array([[200.0, 10.0, 5, 20.0]])
        
        prob_low = pipeline.predict_proba(low_risk)[0, 1]
        prob_high = pipeline.predict_proba(high_risk)[0, 1]
        prob_medium = pipeline.predict_proba(medium)[0, 1]
        
        # RBF kernel should produce different scores for different inputs
        probs = [prob_low, prob_high, prob_medium]
        unique_probs = len(set([round(p, 3) for p in probs]))
        assert unique_probs >= 2, f"RBF kernel should produce different scores, got {probs}"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
