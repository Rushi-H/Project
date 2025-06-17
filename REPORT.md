# AI Chatbot for Modern College Pune

---

## Company Certificate

*(Attach the certificate provided by the company/organization where the training/project was done. If not available, leave this section blank for now.)*

---

## College Certificate

*(Attach the certificate provided by the college for the project/training. If not available, leave this section blank for now.)*

---

## Industrial Training Schedule/Calendar

| Week | Activity/Module                          |
|------|------------------------------------------|
| 1    | Project Introduction, Requirement Study  |
| 2    | Backend Setup (Flask, API, Scraping)     |
| 3    | Frontend Setup (React, UI Design)        |
| 4    | Integration & Testing                    |
| 5    | Documentation & Final Review             |

---

## Problem Definition

Modern College Pune receives a large number of queries from students, parents, and faculty regarding admissions, courses, results, and facilities. Handling these queries manually is time-consuming and inefficient. There is a need for an automated system to provide instant, accurate, and up-to-date responses to common questions.

---

## Existing System

Currently, queries are handled via phone calls, emails, or in-person visits. Information is scattered across various web pages, and users often struggle to find specific answers quickly. Manual handling leads to delays and inconsistent information delivery.

---

## Need for Computerization

- To automate responses to frequently asked questions
- To provide 24/7 support to students, parents, and staff
- To reduce workload on administrative staff
- To ensure consistent and accurate information dissemination

---

## Scope of the Proposed System

- Handles queries related to admissions, courses, results, facilities, and more
- Supports students, parents, and faculty
- Provides up-to-date information by scraping the official college website
- Can be extended to include more preset Q&A and advanced features

---

## Objectives of the Proposed System

- Develop an AI-powered chatbot for Modern College Pune
- Integrate live data scraping and AI-based answering
- Provide a user-friendly web interface
- Enable role-based responses for different user types

---

## Requirements Gathering and Anticipation

- **Functional Requirements:**
  - Chatbot should answer queries about the college
  - Should support multiple user roles
  - Should fetch live data from the college website
- **Non-Functional Requirements:**
  - Fast response time
  - Secure API endpoints
  - Easy to maintain and extend

---

## Platform (H/W, S/W) with Version Details

- **Hardware:**
  - Standard PC/Laptop with internet access
- **Software:**
  - Backend: Python 3.8+, Flask 3.1.1, google-generativeai, requests, beautifulsoup4
  - Frontend: Node.js 18+, React 18.2.0, Vite, Tailwind CSS
  - OS: Windows 10 or above

---

## Analysis Specification (Object Oriented Approach)

- **Main Classes/Objects:**
  - `ChatSession`: Manages user sessions and message history
  - `RoleClassifier`: Determines user role based on input
  - `WebScraper`: Fetches and caches website content
  - `GeminiAI`: Handles AI-based response generation

---

## Design Specification (Object Oriented Approach)

- **Class Diagram:**

  ```
  +----------------+       +----------------+       +----------------+
  | ChatSession    |       | RoleClassifier |       | WebScraper     |
  +----------------+       +----------------+       +----------------+
  | - session_id   |       | - role         |       | - cache_file   |
  | - messages     |       +----------------+       | - urls         |
  +----------------+       | + classify()   |       +----------------+
  | + add_message()|       +----------------+       | + scrape()     |
  | + get_history()|                               | + get_cached() |
  +----------------+                               +----------------+
          |                                               |
          |                                               |
          v                                               v
  +----------------+       +----------------+       +----------------+
  | GeminiAI       |       | UserMessage    |       | ChatResponse   |
  +----------------+       +----------------+       +----------------+
  | - api_key      |       | - message      |       | - response     |
  | - model        |       | - role         |       | - detected_role|
  +----------------+       +----------------+       | - confidence   |
  | + generate()   |       +----------------+       +----------------+
  +----------------+
  ```

- **Sequence Diagram:**

  ```
  User          Frontend          Backend           GeminiAI
   |               |                 |                 |
   |-- query ----->|                 |                 |
   |               |-- POST /api/chat|                 |
   |               |--------------->|                 |
   |               |                 |-- classify() -->|
   |               |                 |<-- role --------|
   |               |                 |-- scrape() -----|
   |               |                 |<-- context -----|
   |               |                 |-- generate() -->|
   |               |                 |<-- response ----|
   |               |<-- JSON response|                 |
   |<-- display ---|                 |                 |
   |               |                 |                 |
  ```

---

## Data Dictionary, Flow Diagram (Whichever is applicable)

- **Data Dictionary:**
  - `UserMessage`: { message: string, role: string }
  - `ChatResponse`: { response: string, detected_role: string, confidence: string/null }

- **Flow Diagram:**

  *(Insert a flowchart showing the flow from user input to AI response)*

---

## Implementation Strategies

- Modular code structure for easy maintenance
- Use of environment variables for sensitive data
- Caching scraped data to reduce load and improve speed
- Responsive frontend design for usability

---

## Input / Output Screens

- **Input:** User types a question in the chat interface
- **Output:** Chatbot displays the answer below the input box

*(Insert screenshots of the chat UI here)*

---

## Decision Tools (If any)

- Google Gemini AI for natural language understanding and response generation
- Role classifier for context-aware answers

---

## Testing Strategies

- Unit testing of backend functions
- Manual testing of chat flows
- Integration testing between frontend and backend
- User acceptance testing with sample queries

---

## Limitations and Drawbacks

- Dependent on the availability and accuracy of the college website
- AI responses may sometimes be generic if context is insufficient
- Requires internet connection for both scraping and AI API

---

## Conclusion

The AI Chatbot for Modern College Pune automates the process of answering common queries, improving efficiency and user satisfaction. It leverages modern web technologies and AI to provide a scalable, maintainable solution for educational institutions.

---

## Future Enhancements

- Add support for more languages
- Integrate with college ERP for personalized data
- Enable voice-based queries
- Add analytics dashboard for admin

---

## User Manual

1. Open the web application in your browser.
2. Type your question in the chat box and press Enter.
3. View the chatbot's response below.
4. For specific queries, use keywords like "admission", "result", "faculty login", etc.

---

## References & Bibliography

- [Modern College Pune Official Website](https://moderncollegepune.edu.in/)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [React Documentation](https://react.dev/)
- [Google Gemini AI](https://ai.google.dev/)
- [BeautifulSoup Documentation](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
- [Vite Documentation](https://vitejs.dev/)

---

*End of Report* 