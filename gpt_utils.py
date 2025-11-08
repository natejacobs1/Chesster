import inspect
from inspect import Parameter
from pydantic import create_model
import os
import google.generativeai as genai

SYS_PROMPT = """You are a chess grandmaster who is helping the user understand a chess position. Only respond to chess-related messages.
If the message is about chess, identify checks, captures, and immediate threats, give strategic ideas and
tactical opportunities, and keep replies concise.
Always respond in a friendly and encouraging tone, suitable for players of all levels.
"""

# Simple Gemini configuration
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("Gemini API key not found. Please set GEMINI_API_KEY environment variable.")
genai.configure(api_key=api_key)

def askgpt(user, model, chess_prompt, msgs=None, system=SYS_PROMPT, max_tokens=None, **kwargs):
    """
    Handles chat interaction using the Gemini API instead of OpenAI.
    """
    # Combine system prompt + user query + chess context
    full_prompt = f"{system}\n\nUser: {user}\n\nChess context: {chess_prompt}"

    # Decide which Gemini model to use. Map common names to actual model IDs.
    model_mapping = {
        'gpt3.5': 'gemini-2.5-flash',  # map GPT name to Gemini equivalent
        'gpt-3.5': 'gemini-2.5-flash',
        'gpt-3.5-turbo': 'gemini-2.5-flash',
        'gemini': 'gemini-2.5-flash',
        'gemini-pro': 'gemini-2.5-flash',
    }
    # Use mapped name, or if it's already a full model name use that, otherwise default
    model_name = model_mapping.get(str(model).lower(), 'gemini-2.5-flash')
    gen_model_name = f"models/{model_name}" if not model_name.startswith('models/') else model_name

    # Call the Gemini model API
    try:
        gen_model = genai.GenerativeModel(gen_model_name)
        response = gen_model.generate_content(full_prompt)
    except Exception as e:
        raise RuntimeError(f"Gemini generation failed with model {gen_model_name}: {e}")

    # Extract generated text from common response shapes
    result_text = None
    if hasattr(response, "text") and response.text:
        result_text = response.text
    elif hasattr(response, "result") and getattr(response, "result"):
        result_text = getattr(response, "result")
    elif isinstance(response, dict):
        # look for candidates / output fields
        if "candidates" in response and len(response["candidates"]) > 0:
            cand = response["candidates"][0]
            result_text = cand.get("content") or cand.get("output") or str(cand)
        else:
            result_text = str(response)
    else:
        # Last resort: try to stringify the object
        result_text = str(response)

    # Maintain chat history compatibility
    msgs_in = [{"role": "system", "content": system},
               {"role": "user", "content": full_prompt}]
    history = msgs_in + [{"role": "assistant", "content": result_text}]

    return response, history

def cost(c, model_name):
    # Gemini API doesn’t return usage data — skip cost tracking
    return 0.0

def schema(f):
    kw = {}
    for name, param in inspect.signature(f).parameters.items():
        annotation = str if param.annotation not in [int, float, str, bool] else param.annotation
        kw[name] = (annotation, ... if param.default == Parameter.empty else param.default)
    s = create_model(f'Input for `{f.__name__}`', **kw).model_json_schema()
    return dict(name=f.__name__, description=f.__doc__, parameters=s)
