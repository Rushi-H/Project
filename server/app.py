from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import google.generativeai as genai
import logging
import time
import json
from datetime import datetime
import re
from typing import Dict, List, Optional
import threading
from functools import lru_cache

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = Flask(__name__)
CORS(app)

# Enhanced logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chat session storage (in production, use Redis or database)
chat_sessions = {}
session_lock = threading.Lock()

# Enhanced preset Q&A with more comprehensive responses
PRESET_QA = {
    "student": {
        "how can i apply for admission": {
            "response": "🎓 **Admission Process:**\n\n1. Visit our admissions portal: https://moderncollegepune.edu.in/admission\n2. Fill out the online application form\n3. Upload required documents (mark sheets, certificates)\n4. Pay the application fee\n5. Wait for merit list publication\n\n📞 Need help? Contact: admissions@moderncollegepune.edu.in",
            "follow_up": ["What documents do I need?", "When is the admission deadline?", "How to check merit list?"]
        },
        "where can i find course details": {
            "response": "📚 **Course Information:**\n\nVisit the 'Academics' section on our website for detailed course information:\n• Undergraduate Programs\n• Postgraduate Programs\n• Professional Courses\n• Syllabus and Curriculum\n\n🔗 Direct link: https://moderncollegepune.edu.in/academics",
            "follow_up": ["What are the eligibility criteria?", "What is the fee structure?", "Are there any scholarships available?"]
        },
        "how can i access student login": {
            "response": "🔐 **Student Portal Access:**\n\n1. Go to the homepage: https://moderncollegepune.edu.in\n2. Click on 'ERP Login' or 'Student Corner'\n3. Use your enrollment number as username\n4. Default password is usually your date of birth (DDMMYYYY)\n\n❓ Forgot password? Contact IT support: it.support@moderncollegepune.edu.in",
            "follow_up": ["How to reset password?", "Portal not working?", "How to update profile?"]
        },
        "how to check exam timetable or results": {
            "response": "📋 **Exams & Results:**\n\n**For Timetables:**\n• Check 'Examinations' section on website\n• Login to student portal\n• Check notice board\n\n**For Results:**\n• Student ERP portal\n• University official website\n• SMS alerts (if registered)\n\n📧 Exam queries: exams@moderncollegepune.edu.in",
            "follow_up": ["Result not showing?", "How to apply for revaluation?", "When are supplementary exams?"]
        },
        "how can i access the library or e-resources": {
            "response": "📖 **Library & E-Resources:**\n\n**Physical Library:**\n• Timing: 8:00 AM - 8:00 PM\n• Location: Central Library, Ground Floor\n\n**Digital Resources:**\n• E-books and journals\n• Online databases\n• Research papers\n• Access via student portal\n\n📚 Library help: library@moderncollegepune.edu.in",
            "follow_up": ["How to issue books?", "Library card renewal?", "Digital library access?"]
        }
    },
    "teacher": {
        "how can teachers access staff login or portal": {
            "response": "👨‍🏫 **Faculty Portal Access:**\n\n1. Visit: https://moderncollegepune.edu.in\n2. Click 'ERP Login' → 'Faculty Login'\n3. Use your employee ID and password\n4. Access attendance, grades, schedules\n\n🔧 Technical support: it.support@moderncollegepune.edu.in\n📞 HR queries: hr@moderncollegepune.edu.in",
            "follow_up": ["Password reset for faculty?", "Update faculty profile?", "Upload course materials?"]
        },
        "where can i find faculty-related circulars or announcements": {
            "response": "📢 **Faculty Announcements:**\n\n**Check these sources:**\n• Faculty portal dashboard\n• 'Notices' section on website\n• Email notifications\n• Department notice boards\n• WhatsApp faculty groups\n\n📧 Admin queries: admin@moderncollegepune.edu.in",
            "follow_up": ["Subscribe to notifications?", "Miss important circular?", "Contact administration?"]
        },
        "how can i participate in faculty development programs": {
            "response": "🎯 **Faculty Development Programs:**\n\n**Available Programs:**\n• Workshops and seminars\n• Online courses\n• Research methodology\n• Technology integration\n\n**How to participate:**\n• Check IQAC section on website\n• Faculty portal announcements\n• Direct registration links\n\n📧 FDP queries: iqac@moderncollegepune.edu.in",
            "follow_up": ["Current FDP schedule?", "Certificate programs?", "Research opportunities?"]
        }
    },
    "parent": {
        "how can parents track student performance": {
            "response": "👨‍👩‍👧‍👦 **Student Performance Tracking:**\n\n**Available Methods:**\n• Parent portal access (request from admin)\n• SMS alerts for attendance/marks\n• Parent-teacher meetings\n• Progress reports\n\n**To get access:**\n1. Contact admin office with student details\n2. Provide your contact information\n3. Receive login credentials\n\n📞 Parent support: parents@moderncollegepune.edu.in",
            "follow_up": ["Set up SMS alerts?", "Parent meeting schedule?", "Academic counseling?"]
        },
        "how do i contact a specific department or faculty": {
            "response": "📞 **Department & Faculty Contacts:**\n\n**Methods to contact:**\n• Department pages on website\n• 'Contact Us' section\n• Faculty directory\n• Reception desk: 020-2553-2878\n\n**Popular Departments:**\n• Arts & Commerce\n• Science\n• Computer Science\n• Management\n\n📧 General: info@moderncollegepune.edu.in",
            "follow_up": ["Faculty office hours?", "Department heads contact?", "Academic coordinator?"]
        },
        "is hostel facility available": {
            "response": "🏠 **Hostel Facilities:**\n\n**Current Status:**\n• Limited hostel facilities available\n• Separate hostels for boys and girls\n• Basic amenities provided\n\n**For admission:**\n1. Contact college administration\n2. Fill hostel application form\n3. Submit required documents\n4. Wait for allotment\n\n📞 Hostel queries: hostel@moderncollegepune.edu.in",
            "follow_up": ["Hostel fees?", "Room availability?", "Hostel rules?"]
        }
    },
 "general": {
    "what is the official website of modern college pune": {
        "response": "🌐 **Official Website:**\n\nhttps://moderncollegepune.edu.in\n\n**Key Sections:**\n• About Us\n• Academics\n• Admissions\n• Student Corner\n• Contact Us",
        "follow_up": ["How to reach college?", "Where to find admission updates?", "Student login link?"]
    }
}
}

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