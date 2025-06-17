# AI Chatbot for Modern College Pune

---

## Title Page

**Project Title:** AI Chatbot for Modern College Pune  
**Submitted by:** [Your Name]  
**Department:** [Your Department]  
**College:** Modern College Pune  
**Date:** [Submission Date]

---

## Table of Contents

1. [Introduction](#introduction)
2. [Project Structure](#project-structure)
3. [Setup Instructions](#setup-instructions)
4. [Backend (Flask)](#backend-flask)
5. [Frontend (React + Vite)](#frontend-react--vite)
6. [API Reference](#api-reference)
7. [Customization](#customization)
8. [Screenshots](#screenshots)
9. [FAQ / Troubleshooting](#faq--troubleshooting)
10. [Contact](#contact)

---

## Introduction

This project is a full-stack AI-powered chatbot designed to answer queries about Modern College Pune. It consists of a React + Vite frontend and a Flask backend that uses Google Gemini AI and web scraping to provide up-to-date, context-aware answers.

**Key Features:**
- Conversational AI for college-related queries
- Live data scraping from the official college website
- Role-based responses (student, teacher, parent, general)
- Modern, responsive UI

---

## Project Structure

```
Project/
│
├── client/      # Frontend (React + Vite)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── server/      # Backend (Flask)
│   ├── app.py
│   ├── requirements.txt
│   └── ...
│
└── DOCUMENTATION.md    # Project documentation
```

---

## Setup Instructions

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm 9+

### Backend Setup
1. Open a terminal and navigate to `Project/server`.
2. Install dependencies:
   ```
   pip install -r requirements.txt
   pip install google-generativeai requests beautifulsoup4
   ```
3. Create a `.env` file with your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```
4. Start the backend server:
   ```
   python app.py
   ```
   The server runs at `http://localhost:5000`.

### Frontend Setup
1. Open a terminal and navigate to `Project/client`.
2. Install dependencies:
   ```
   npm install
   ```
3. Start the frontend development server:
   ```
   npm run dev
   ```
   The app runs at `http://localhost:5173` by default.

---

## Backend (Flask)

- **Main File:** `server/app.py`
- **Framework:** Flask
- **Key Libraries:** flask_cors, python-dotenv, google-generativeai, requests, beautifulsoup4
- **API Endpoint:**
  - `POST /api/chat`
    - Request: `{ "message": "your question", "role": "optional" }`
    - Response: `{ "response": "...", "detected_role": "...", "confidence": ... }`
- **Logic:**
  - Loads environment variables (API keys) from `.env`
  - Scrapes and caches content from the official college website
  - Uses Google Gemini AI to generate answers based on scraped content
  - Can be extended to provide preset answers for specific queries

**Dependencies:**
```
blinker==1.9.0
click==8.2.1
colorama==0.4.6
Flask==3.1.1
itsdangerous==2.2.0
Jinja2==3.1.6
MarkupSafe==3.0.2
Werkzeug==3.1.3
flask_cors==3.0.10
python-dotenv==1.0.0
google-generativeai
requests
beautifulsoup4
```

---

## Frontend (React + Vite)

- **Main Directory:** `client/src/`
- **Framework:** React
- **Bundler:** Vite
- **Styling:** Tailwind CSS
- **Key Libraries:** react, react-dom, react-toastify, lucide-react

**Scripts:**
```
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Lint code
npm run preview  # Preview production build
```

**Dependencies:** See `client/package.json` for all dependencies and scripts.

---

## API Reference

### POST `/api/chat`
- **Description:** Main endpoint for chatbot queries.
- **Request Body:**
  ```json
  {
    "message": "your question",
    "role": "student|teacher|parent|general" // optional
  }
  ```
- **Response:**
  ```json
  {
    "response": "AI or preset answer",
    "detected_role": "student|teacher|parent|general",
    "confidence": null
  }
  ```

---

## Customization

- **Preset Q&A:**
  - You can add a dictionary of preset questions and answers in the backend for instant responses to common queries.
- **Scraping:**
  - The backend can be extended to scrape more pages or specific data (like merit lists, images, etc.).
- **UI:**
  - The frontend can be styled and branded as per college requirements.

---

## Screenshots

*(Add screenshots of the chat UI and example answers here)*

---

## FAQ / Troubleshooting

**Q: The server says 'ModuleNotFoundError'?**
- A: Run `pip install -r requirements.txt` and install any missing packages as shown in the error.

**Q: The chatbot is not responding?**
- A: Ensure both backend and frontend servers are running, and the `.env` file is correctly set up.

**Q: How do I add more preset answers?**
- A: Edit the backend code to include more entries in the preset Q&A dictionary.

---

## Contact

For queries or contributions, contact the project maintainer or your college supervisor.

---

*End of Documentation* 