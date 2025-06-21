Prompt:

You are a full-stack software developer. You will implement an IT support system project with the details given below. This system will prioritize support requests according to SLA (Service Level Agreement) and AI content analysis and direct them to the appropriate level support team (L1 or L2). The project will be developed with React frontend, MongoDB backend and Local Ollama AI.

🧱 Project Name:
AI-Powered IT Support Ticket Prioritization System

🔧 Technologies to be Used:
Frontend: React + TailwindCSS

Backend: Node.js + Express

Database: MongoDB (with mongoose)

AI: Local Ollama (localhost:11434)

Model: LLaMA3 (or another text analysis model)

Tool: Will be developed on Cursor AI

✅ Application Summary:
User creates a support request (ticket) via email, phone or form.

Manual priority score is assigned according to the user's SLA level (0–4).

Ticket content is sent to Local Ollama and complexity level score is obtained with AI content analysis (1–5).

According to the two scores, the ticket is assigned to:

L1 (simple tasks, low-cost personnel)

L2 (complex tasks, expert personnel)
teams.

The ticket's resolution method (phone, email, portal) is determined.

The ticket's resolution status can be updated (open → in_progress → resolved).

📦 MongoDB Ticket Model (ticket.js)
js
Copy
Edit
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
customer_name: String,
sla_level: String, // Gold, Silver, Bronze
issue_description: String,
issue_type: String, // network, software, access etc.
ticket_source: String, // email, phone, manual
created_at: { type: Date, default: Date.now },
sla_priority: Number, // 0–4
ai_priority: Number, // 1–5
assigned_level: String, // L1 or L2
resolution_method: String, // phone, email, portal
status: { type: String, default: "open" } // open, in_progress, resolved
});

module.exports = mongoose.model("Ticket", ticketSchema);
🧠 Ollama API – System Prompt (AI Complexity Score)
txt
Copy
Edit
You are an artificial intelligence working in an IT support system. Your task is to analyze the technical complexity level of support requests based on their textual descriptions.

Please strictly follow the rules below:

1. Evaluate complexity with a numerical score between 1 and 5:

   - 1: Very simple (e.g. password reset)
   - 2: Simple (e.g. printer connection)
   - 3: Medium level (e.g. VPN problem)
   - 4: Complex (e.g. network access, domain)
   - 5: Very complex (e.g. data loss, system crash)

2. Give only a number answer. Do not write explanations or other characters. E.g: `3`

3. When you are unsure, give a score of `3`.

Your answer should only be 1, 2, 3, 4 or 5. Do not write anything else.
🔁 Ollama API call (Backend example)
js
Copy
Edit
const getAIPriority = async (ticketText) => {
const response = await fetch("http://localhost:11434/api/generate", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "llama3",
system: systemPromptText,
prompt: `Support request: "${ticketText}"`,
stream: false
})
});
const data = await response.json();
return parseInt(data.response.trim());
};
⚙️ SLA Priority Calculation (Backend)
js
Copy
Edit
const slaMap = {
Gold: 4,
Silver: 2,
Bronze: 1,
None: 0
};
ticket.sla_priority = slaMap[ticket.sla_level];
🎯 Support Level Routing (L1 / L2)
js
Copy
Edit
ticket.assigned_level = ticket.ai_priority >= 4 || ticket.sla_priority >= 3
? "L2"
: "L1";
🧩 API Endpoints (Express)
http
Copy
Edit
GET /api/tickets → Get all tickets
POST /api/tickets → Create new ticket
GET /api/tickets/:id → Get specific ticket
PUT /api/tickets/:id → Update ticket (status etc.)
POST /api/analyze → Get AI analysis via Ollama
🖥️ React Pages and Components
TicketForm: Create new ticket

TicketList: List of all tickets (status, priority etc.)

TicketDetails: Single ticket details

Dashboard: Priority and non-priority ticket separation

AdminPanel: SLA level and customer management (optional)

🧪 Sample Ticket JSON
json
Copy
Edit
{
"customer_name": "XYZ Ltd.",
"sla_level": "Gold",
"issue_description": "Firewall users cannot establish VPN connection.",
"ticket_source": "email",
"issue_type": "network"
}
🗃️ Suggested File Structure
bash
Copy
Edit
/client (React)
├── /components
├── /pages
├── App.jsx
└── main.jsx

/server (Node.js)
├── /models/ticket.js
├── /routes/tickets.js
├── /controllers/ai.js
└── server.js

/prompt
└── system.txt (Ollama system prompt)
