from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import logging
import time
import requests
from bs4 import BeautifulSoup

# Load .env variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


# --- Scraper & Caching Logic --- #
def get_cached_college_content():
    cache_file = "college_cache.txt"
    cache_duration = 86400  # 24 hours

    if os.path.exists(cache_file):
        if time.time() - os.path.getmtime(cache_file) < cache_duration:
            with open(cache_file, "r", encoding="utf-8") as f:
                return f.read()

    urls = [
        "https://moderncollegepune.edu.in",
        "https://moderncollegepune.edu.in/admission",
        "https://moderncollegepune.edu.in/academics",
        "https://moderncollegepune.edu.in/student-corner",
    ]

    content = ""
    for url in urls:
        try:
            response = requests.get(url, timeout=10)
            soup = BeautifulSoup(response.text, "html.parser")
            for tag in soup(["script", "style", "noscript"]):
                tag.decompose()
            content += soup.get_text(separator=" ", strip=True) + "\n\n"
        except Exception as e:
            content += f"Error fetching {url}: {e}\n\n"

    with open(cache_file, "w", encoding="utf-8") as f:
        f.write(content)

    return content


# --- Role Classifier --- #
def classify_role(message: str) -> str:
    msg = message.lower()
    if any(word in msg for word in ["admission", "exam", "student login", "course", "library", "timetable"]):
        return "student"
    elif any(word in msg for word in ["faculty", "teacher", "staff login", "circular", "announcement", "fdp"]):
        return "teacher"
    elif any(word in msg for word in ["parent", "track student", "performance", "contact faculty", "hostel"]):
        return "parent"
    else:
        return "general"


# --- Gemini Chat API --- #
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    role = data.get("role") or classify_role(user_msg)

    logger.info(f"User message: {user_msg} | Role: {role}")

    # Get website context
    context = get_cached_college_content()
    trimmed_context = context[:8000]  # token safe

    prompt_parts = [
        "You are an AI assistant for Modern College Pune.",
        "Use only this college information for answering:",
        trimmed_context,
        f"User asked: {user_msg}",
        "Respond briefly and factually based on context only."
    ]

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(prompt_parts)
        reply = response.text.strip()
    except Exception as e:
        reply = f"Sorry, something went wrong. ({str(e)})"

    return jsonify({
        "response": reply,
        "detected_role": role,
        "confidence": None
    })


if __name__ == "__main__":
    app.run(debug=True, port=5000)
