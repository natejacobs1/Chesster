import google.generativeai as genai
import os

key = os.getenv("GEMINI_API_KEY")
if not key:
    print("GEMINI_API_KEY not set in environment.")
else:
    genai.configure(api_key=key)
    print("Available models:")
    for m in genai.list_models():
        print(" ", m.name)
