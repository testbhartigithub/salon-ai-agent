import express from "express";
import fs from "fs";
import bodyParser from "body-parser";

const app = express();
const PORT = 3000;
const HELP_FILE = "./helpRequests.json";
const KNOWLEDGE_FILE = "./knowledgeBase.json";

app.use(bodyParser.json());
app.use(express.static("public"));

// Helper functions
function load(file) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify([]));
  return JSON.parse(fs.readFileSync(file));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// API: Get all pending requests
app.get("/requests", (req, res) => {
  const requests = load(HELP_FILE);
  res.json(requests);
});

// API: Submit supervisor answer
app.post("/respond", (req, res) => {
  const { question, answer } = req.body;

  const requests = load(HELP_FILE);
  const target = requests.find((r) => r.question === question);
  if (!target) return res.status(404).send("Request not found");

  target.answered = true;
  target.answer = answer;
  target.answeredAt = new Date().toISOString();
  save(HELP_FILE, requests);

  // Update Knowledge Base
  const kb = load(KNOWLEDGE_FILE);
  kb.push({ question, answer });
  save(KNOWLEDGE_FILE, kb);

  console.log(`📱 [AI FOLLOW-UP] → "Hello! Regarding '${question}', our supervisor says: '${answer}'"`);
  res.send({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`🧑‍💻 Supervisor dashboard running at http://localhost:${PORT}`);
});
