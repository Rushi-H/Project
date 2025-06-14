from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

# Preset Q&A by user roles for Modern College Pune
PRESET_QA = {
    "student": {
        "how can i apply for admission": "Apply via the 'Admissions' section: https://moderncollegepune.edu.in/admission.",
        "where can i find course details": "Visit the 'Academics' section or relevant department pages on the website.",
        "how can i access student login": "Use the 'ERP Login' or 'Student Corner' on the homepage.",
        "how to check exam timetable or results": "Go to the 'Examinations' or 'Notices' section for updates.",
        "how can i access the library or e-resources": "Visit the 'Library' section for e-books, journals, and resources."
    },
    "teacher": {
        "how can teachers access staff login or portal": "Faculty can log in through the 'ERP Login' on the homepage.",
        "where can i find faculty-related circulars or announcements": "Check 'Notices' or 'Announcements' regularly.",
        "how can i participate in faculty development programs": "FDPs are listed under 'IQAC' or 'Events'."
    },
    "parent": {
        "how can parents track student performance": "Request ERP access via the admin office or contact support.",
        "how do i contact a specific department or faculty": "Use department pages or the 'Contact' section on the site.",
        "is hostel facility available": "Limited hostel facilities are available. Contact the college admin for details."
    },
    "general": {
        "what is the official website of modern college pune": "The official website of Modern College, Pune is https://moderncollegepune.edu.in/.",
        "where is modern college located": "Modern College is located at Shivajinagar, Pune - 411005, Maharashtra, India.",
        "how do i contact modern college pune": "Call 020-2553 2878 or email moderncollegepune@moderncollegepune.edu.in.",
        "who is the principal of modern college pune": "The Principal is Dr. R.G. Pardeshi. See 'Principal’s Desk' on the website."
    }
}

genai.configure(api_key=GEMINI_API_KEY)

def classify_role(message: str) -> str:
    """Basic keyword-based role classifier."""
    msg = message.lower()
    if any(word in msg for word in ["admission", "exam", "student login", "course", "library", "timetable"]):
        return "student"
    elif any(word in msg for word in ["faculty", "teacher", "staff login", "circular", "announcement", "fdp"]):
        return "teacher"
    elif any(word in msg for word in ["parent", "track student", "performance", "contact faculty", "hostel"]):
        return "parent"
    else:
        return "general"

def get_gemini_response(message: str) -> str:
    try:
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = (
            "You are a helpful assistant for answering queries about Modern College Pune "
            "(https://moderncollegepune.edu.in/). Respond clearly and briefly (1-2 sentences): " + message
        )
        response = model.generate_content(prompt)
        return response.text.strip()
    except Exception:
        return "Sorry, I couldn't answer that at the moment. Please try again later."

@app.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({"error": "No message provided."}), 400

    message = data['message'].strip()
    role = data.get('role')  # Optional role

    if not role:
        role = classify_role(message)

    normalized = message.lower()
    role_answers = PRESET_QA.get(role, {})
    preset_answer = role_answers.get(normalized)

    if preset_answer:
        response = preset_answer
    else:
        response = get_gemini_response(message)

    return jsonify({"response": response, "detected_role": role})

if __name__ == '__main__':
    app.run(debug=True, port=5000, host='0.0.0.0')
