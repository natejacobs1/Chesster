import os
import google.generativeai as genai

print("Testing Gemini API configuration...")
print(f"API Key (first 4 chars): {os.getenv('GEMINI_API_KEY')[:4]}...")

try:
    genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
    
    print("\nAvailable models:")
    for m in genai.list_models():
        print(f"- {m.name}: {m.supported_generation_methods}")
        
    # Try a simple generation
    print("\nTesting generation:")
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content('Greet Hello!)
    print(f"Response: {response.text}")
    
except Exception as e:
    print(f"\nError occurred: {str(e)}")
