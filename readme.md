# Salon AI Agent

🚀 **Salon AI Agent** is a prototype AI assistant for salon services that can answer client questions automatically and seek supervisor help when needed. It demonstrates real-time collaboration between an AI, a CLI-based client, and a supervisor dashboard.

---

## **System Overview**

- AI handles client questions via **CLI (Command-Line Interface)**.
- If AI knows the answer from the **knowledge base**, it responds immediately.
- If AI does not know the answer, it triggers a **help request** to the supervisor.
- Supervisor responds through a **web dashboard** (real-time updates via Socket.IO).
- Once supervisor answers, AI immediately responds to the client.
- Questions are handled **sequentially** to ensure one question is resolved before moving to the next.

---

## **Key Decisions Made**

- **Node.js** for backend and CLI interaction.
- **Socket.IO** for real-time communication between AI and supervisor dashboard.
- JSON files for storing **help requests** and **knowledge base** for simplicity.
- Supervisor dashboard is responsive and shows **unanswered questions first**.
- Sequential question handling ensures no questions are skipped.

---

## **Current Limitations**

- Client interface is CLI-based; no web UI yet.
- Supervisor must manually type answers; no live call support.
- No authentication or multi-supervisor support.
- JSON storage limits scalability; reloading may overwrite data.

---

## **Suggested Improvements (Phase 2 Ideas)**

- **Client UI:** Web interface for clients to ask questions.
- **Real-time typing indicators:** Show AI “thinking” status.
- **Multi-client support:** Handle multiple clients at once.
- **Session & history tracking:** Keep past questions/answers.
- **Supervisor Enhancements:**
  - Authentication and roles.
  - Multiple supervisors answering in real-time.
  - Notifications and search/filter requests.
- **AI knowledge improvements:**
  - Auto-learn from supervisor-approved answers.
  - NLP-based question matching.
  - Context-aware conversation handling.
- **Call & Communication Improvements:**
  - Live call handling: hold, transfer, resolve live.
  - Fallback text-based flow if supervisor unavailable.
  - Multi-channel support (chat, WhatsApp, email).
- **Tech & Architecture Improvements:**
  - Use React for dynamic frontend.
  - Move to database storage (MongoDB/PostgreSQL).
  - Add logging, error handling, and testing.

---

## **Demo Flow**

1. Start the agent via CLI.
2. Client asks a question.
3. AI responds if answer exists; otherwise triggers a help request.
4. Supervisor answers on the web dashboard.
5. AI responds to the client automatically.
6. Supervisor dashboard updates in real-time, showing **unanswered questions first**.

---

## **Installation**

```bash
git clone <repo-url>
cd salon-ai-agent
npm install
node agent.js
