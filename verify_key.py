import os
import google.generativeai as genai

def verify_key():
    key = os.getenv("GEMINI_API_KEY")
    if not key:
        print("❌ No GEMINI_API_KEY found in environment")
        return False
        
    print(f"📝 Found API key (starts with: {key[:4]}...)")
    
    try:
        genai.configure(api_key=key)
        models = list(genai.list_models())
        print(f"✅ API key works! Found {len(models)} available models")
        print("\nExample models:")
        for m in models[:3]:
            print(f"- {m.name}")
        return True
    except Exception as e:
        print(f"❌ Error testing API key: {e}")
        return False

if __name__ == "__main__":
    verify_key()