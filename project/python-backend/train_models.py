import requests
import json

def train_all_models():
    url = "http://localhost:8000/api/ai/train"
    try:
        print("🧠 Training AI models...")
        response = requests.post(url)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Training Result:")
            print(json.dumps(result, indent=2))
        else:
            print(f"❌ Training failed with status: {response.status_code}")
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"❌ Training failed: {e}")

if __name__ == "__main__":
    # First check if server is running
    try:
        status = requests.get("http://localhost:8000/")
        print("✅ AI Service is running")
        train_all_models()
    except:
        print("❌ AI Service not running. Start it first with: python app.py")