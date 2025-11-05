import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";

const HELP_FILE = "./helpRequests.json";
const KNOWLEDGE_FILE = "./knowledgeBase.json";

// Helper functions
function load(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
}
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function findAnswer(question) {
  const kb = load(KNOWLEDGE_FILE);
  const match = kb.find(item => question.toLowerCase().includes(item.question.toLowerCase()));
  return match ? match.answer : null;
}

function createHelpRequest(question) {
  const requests = load(HELP_FILE);
  const newReq = { question, time: new Date().toISOString(), answered: false };
  requests.push(newReq);
  save(HELP_FILE, requests);
  return newReq;
}

// ================= Socket.IO for supervisor dashboard =================
const app = require("express")();
const httpServer = require("http").createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = 4000;

app.use(require("express").static("public"));

io.on("connection", socket => {
  console.log("🧑‍💻 Supervisor connected");
  socket.emit("helpRequests", load(HELP_FILE));

  socket.on("answerQuestion", ({ question, answer }) => {
    const requests = load(HELP_FILE);
    const req = requests.find(r => r.question === question);
    if (req) {
      req.answered = true;
      req.answer = answer;
      req.answeredAt = new Date().toISOString();
      save(HELP_FILE, requests);

      // Update knowledge base
      const kb = load(KNOWLEDGE_FILE);
      kb.push({ question, answer });
      save(KNOWLEDGE_FILE, kb);

      io.emit("helpRequests", requests);

      // Notify CLI AI
      console.log(`\nAI: Supervisor answered: "${answer}" for question "${question}"\n`);
      waitingResolve && waitingResolve(); // allow next question
    }
  });
});

httpServer.listen(PORT, () => {
  console.log(`Supervisor Dashboard running at http://localhost:${PORT}`);
});

// ================= CLI Question Handling =================
import readline from "readline/promises";
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let waitingResolve = null;

async function askClientSequential() {
  while (true) {
    const question = await rl.question("📞 Client asks: ");
    if (!question.trim()) continue;

    const answer = findAnswer(question);
    if (answer) {
      console.log(`AI: ${answer}\n`);
      continue;
    }

    console.log("AI: Let me check with my supervisor...\n");

    // Create help request
    createHelpRequest(question);
    io.emit("helpRequests", load(HELP_FILE));

    // Wait until supervisor answers
    await new Promise(resolve => { waitingResolve = resolve; });
  }
}

console.log("Salon AI Agent started. Type your question:");
askClientSequential();
