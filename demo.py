"""
HilbertShield Demo Script
Demonstrates fraud detection capabilities with example transactions
"""
import requests
import json
import time

API_URL = "http://localhost:5000/scan"

# Example transactions
transactions = [
    {
        "name": "Low-Risk: Grocery Store Purchase",
        "data": {
            "amount": 45.50,
            "time": 10.0,
            "merchant_category": 1,
            "distance_from_home": 2.5
        },
        "expected": "ALLOW"
    },
    {
        "name": "Low-Risk: Gas Station",
        "data": {
            "amount": 60.00,
            "time": 17.5,
            "merchant_category": 0,
            "distance_from_home": 5.0
        },
        "expected": "ALLOW"
    },
    {
        "name": "Medium-Risk: Restaurant Late Evening",
        "data": {
            "amount": 150.00,
            "time": 22.0,
            "merchant_category": 3,
            "distance_from_home": 15.0
        },
        "expected": "ALLOW or BLOCK"
    },
    {
        "name": "High-Risk: Large Electronics Purchase at Night",
        "data": {
            "amount": 2500.00,
            "time": 2.5,
            "merchant_category": 8,
            "distance_from_home": 200.0
        },
        "expected": "BLOCK"
    },
    {
        "name": "High-Risk: Jewelry Store Far From Home",
        "data": {
            "amount": 5000.00,
            "time": 1.0,
            "merchant_category": 9,
            "distance_from_home": 500.0
        },
        "expected": "BLOCK"
    },
    {
        "name": "Edge Case: Zero Distance",
        "data": {
            "amount": 100.00,
            "time": 12.0,
            "merchant_category": 5,
            "distance_from_home": 0.0
        },
        "expected": "ALLOW"
    }
]

def test_transaction(transaction):
    """Test a single transaction"""
    print(f"\n{'='*70}")
    print(f"Transaction: {transaction['name']}")
    print(f"Expected: {transaction['expected']}")
    print(f"{'='*70}")
    
    data = transaction['data']
    print(f"\nInput:")
    print(f"  Amount: ${data['amount']:.2f}")
    print(f"  Time: {data['time']:.1f}:00 ({int(data['time'])}:00)")
    print(f"  Merchant Category: {data['merchant_category']}")
    print(f"  Distance from Home: {data['distance_from_home']:.1f} km")
    
    try:
        response = requests.post(API_URL, json=data, timeout=5)
        
        if response.status_code == 200:
            result = response.json()
            print(f"\nResult:")
            print(f"  Risk Score: {result['risk_score']:.4f}")
            print(f"  Verdict: {result['verdict']}")
            print(f"  Processing Time: {result['processing_time_ms']:.2f} ms")
            
            # Color-code verdict
            if result['verdict'] == 'BLOCK':
                print(f"  ⚠️  FRAUD DETECTED - Transaction blocked!")
            else:
                print(f"  ✅ Transaction allowed")
        else:
            print(f"\n❌ Error: {response.status_code}")
            print(response.json())
            
    except requests.exceptions.ConnectionError:
        print("\n❌ Error: Cannot connect to API server")
        print("Make sure the server is running: python api/server.py")
        return False
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        return False
    
    return True

def main():
    """Run demo"""
    print("="*70)
    print("HilbertShield Fraud Detection Demo")
    print("Quantum Kernel Methods for Real-Time Fraud Detection")
    print("="*70)
    
    # Check if server is running
    try:
        response = requests.get("http://localhost:5000/health", timeout=2)
        if response.status_code == 200:
            print("\n✅ API Server is running")
        else:
            print("\n⚠️  API Server returned unexpected status")
    except:
        print("\n❌ API Server is not running!")
        print("\nPlease start the server first:")
        print("  python api/server.py")
        print("\nOr use the deployment script:")
        print("  deploy.bat")
        return
    
    # Test each transaction
    for i, transaction in enumerate(transactions, 1):
        if not test_transaction(transaction):
            break
        if i < len(transactions):
            time.sleep(0.5)  # Brief pause between requests
    
    print(f"\n{'='*70}")
    print("Demo Complete!")
    print("="*70)
    print("\nKey Insights:")
    print("• Low amounts + daytime + common merchants = LOW RISK")
    print("• High amounts + night + risky merchants + far distance = HIGH RISK")
    print("• RBF kernel detects non-linear patterns in Hilbert space")
    print("• Processing time < 50ms for real-time fraud prevention")
    print("\nRead marketing/tech_brief.md for technical details")

if __name__ == "__main__":
    main()
