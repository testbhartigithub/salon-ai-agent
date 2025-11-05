
import fs from "fs";
import { createServer } from "http";
import { Server } from "socket.io";
import express from "express";
import readline from "readline/promises";

// ================= File paths =================
const HELP_FILE = "./helpRequests.json";
const KNOWLEDGE_FILE = "./knowledgeBase.json";

// ================= Helper functions =================
function load(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "[]");
  return JSON.parse(fs.readFileSync(file));
}
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function findAnswer(question) {
  const kb = load(KNOWLEDGE_FILE);
  const match = kb.find(item =>
    question.toLowerCase().includes(item.question.toLowerCase())
  );
  return match ? match.answer : null;
}

function createHelpRequest(question) {
  const requests = load(HELP_FILE);
  const newReq = { question, time: new Date().toISOString(), answered: false };
  requests.push(newReq);
  save(HELP_FILE, requests);
  return newReq;
}

// ================= Socket.IO Supervisor Dashboard =================
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });
const PORT = 4000;

// Serve static dashboard files
app.use(express.static("public"));

// Supervisor connections
io.on("connection", socket => {
  console.log("🧑‍💻 Supervisor connected");

  // Send all current help requests
  socket.emit("helpRequests", load(HELP_FILE));

  // When supervisor answers a question
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

      // Notify all dashboard clients
      io.emit("helpRequests", requests);

      // Notify CLI AI that answer is ready
      if (waitingResolve) waitingResolve();
    }
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Supervisor Dashboard running at http://localhost:${PORT}`);

  // Start CLI after server is ready
  setTimeout(() => {
    console.log("Salon AI Agent started. Type your question:");
    askClientSequential();
  }, 100);
});

// ================= CLI Question Handling =================
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let waitingResolve = null;

async function askClientSequential() {
  while (true) {
    const question = await rl.question("Client asks: ");
    if (!question.trim()) continue;

    const answer = findAnswer(question);
    if (answer) {
      console.log(`AI: ${answer}\n`);
      continue; // ask next question
    }

    console.log("AI: Let me check with my supervisor...\n");

    // Create help request
    createHelpRequest(question);
    io.emit("helpRequests", load(HELP_FILE));

    // Wait until supervisor answers
    await new Promise(resolve => { waitingResolve = resolve; });

    const updatedReq = load(HELP_FILE).find(r => r.question === question);
    if (updatedReq && updatedReq.answered) {
      console.log(`AI (after supervisor help): ${updatedReq.answer}\n`);
    }
  }
}
