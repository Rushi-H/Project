from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import time
from bs4 import BeautifulSoup
import google.generativeai as genai

# Configure Gemini API key
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = Flask(__name__)
CORS(app)

# Scrape and cache content from college website
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
        "https://moderncollegepune.edu.in/contact",  # added contact page
    ]

    content = ""
    for url in urls:
        try:
            res = requests.get(url, timeout=10)
            soup = BeautifulSoup(res.text, "html.parser")
            for tag in soup(["script", "style", "noscript"]):
                tag.decompose()
            content += soup.get_text(separator=" ", strip=True) + "\n\n"
        except:
            pass

    with open(cache_file, "w", encoding="utf-8") as f:
        f.write(content)

    return content

# Classify user role based on message
def classify_role(msg):
    msg = msg.lower()
    if any(w in msg for w in ["admission", "exam", "login", "course", "library", "timetable"]):
        return "student"
    elif any(w in msg for w in ["faculty", "teacher", "staff", "circular", "fdp"]):
        return "teacher"
    elif any(w in msg for w in ["parent", "track", "performance", "hostel"]):
        return "parent"
    return "general"

# Chat endpoint
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.get_json()
    user_msg = data.get("message", "")
    role = data.get("role") or classify_role(user_msg)

    context = get_cached_college_content()[:8000]

    prompt = [
        "You are an AI assistant for Modern College of Arts, Science and Commerce, Shivajinagar, Pune.",
        "College Website: https://moderncollegepune.edu.in",
        "Use the following content from the college website to answer the user's query.",
        "Only provide answers that are based on the information below:",
        context,
        f"The user asked: {user_msg}",
        "Respond clearly, accurately, and briefly using only the provided college information."
    ]

    try:
        model = genai.GenerativeModel("models/gemini-1.5-flash")
        response = model.generate_content(prompt)
        reply = response.text.strip()
    except Exception as e:
        reply = "Sorry, something went wrong."

    return jsonify({
        "response": reply,
        "detected_role": role
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)
