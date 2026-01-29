require("dotenv").config();
const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const { GoogleGenAI } = require("@google/genai");

const app = express();

// --- ១. រៀបចំ ROUTES សម្រាប់ទំព័រនីមួយៗ ---
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "view/index.html")));
app.get("/culture", (req, res) =>
  res.sendFile(path.join(__dirname, "view/culture.html")),
);
app.get("/visualizer", (req, res) =>
  res.sendFile(path.join(__dirname, "view/visualizer.html")),
);
app.get("/study-buddy", (req, res) => {
  res.sendFile(path.join(__dirname, "view/study-buddy.html"));
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

io.on("connection", (socket) => {
  console.log("✅ User connected: " + socket.id);

  // --- ២. មុខងារ AI CODE REVIEWER & FIXER ---
  socket.on("review_code", async (data) => {
    const { code, userComment } = data;
    try {
      const prompt = `
        You are a funny and expert Khmer Senior Developer.
        Task: Analyze the code and user comment.
        STRICT SENTIMENT RULES:
        - If user uses "😭", "💔", "😡", or "អាប្រកាច់" -> sentiment is "angry" or "sad".
        - If user is joking -> sentiment is "happy".
        - Respond ONLY with raw JSON:
        {
          "sentiment": "happy/angry/sad/confused",
          "humorous_response": "ចម្លើយលេងសើចបែបឌឺដង ឬលួងលោមជាភាសាខ្មែរ",
          "technical_review": "ការវិភាគបច្ចេកទេស",
          "fixed_code": "..."
        }
        User says: "${userComment}" | Code: "${code}"`;

      const result = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      const text =
        result.text || result.candidates?.[0]?.content?.parts?.[0]?.text;
      const cleanJson = text.replace(/```json|```/g, "").trim();
      socket.emit("review_result", JSON.parse(cleanJson));
    } catch (e) {
      socket.emit("error_occured", e.message);
    }
  });

  // --- ៣. មុខងារ AI KHMER CULTURE GUIDE ---
// នៅក្នុង server.js ផ្នែក socket.on("ask_culture", ...)
socket.on("ask_culture", async (data) => {
    const { question, type } = data; // ទាញយកសំណួរ និងប្រភេទ (Brief/Detailed)
    
    try {
        const lengthInstruction = type === "detailed" 
            ? "Provide a comprehensive, deep-dive explanation with historical context and specific details." 
            : "Make it very short, punchy, and highlight only the most important facts.";

        const prompt = `
        You are a Khmer Culture Expert specializing in Angkor Wat and traditional arts.
        Task: Answer this question: "${question}"
        
        FORMAT INSTRUCTION: ${lengthInstruction}
        LANGUAGE: Funny and witty Khmer.
        
        GUARDRAIL: If the question is NOT about Khmer culture, politely refuse in a funny way.
        `;

        const result = await client.models.generateContent({
            model: "gemini-2.5-flash", // ប្រើម៉ូដែល Gemini 2.5 ដែលប្អូនមាន
            contents: [{ role: "user", parts: [{ text: prompt }] }],
        });

        socket.emit("culture_result", { response: result.text || result.candidates?.[0]?.content?.parts?.[0]?.text });
    } catch (e) {
        socket.emit("error_occured", e.message);
    }
});

  // --- ៤. មុខងារ AI LOGIC VISUALIZER (Mermaid.js) ---
  socket.on("visualize_logic", async (data) => {
    try {
      console.log("🔍 កំពុងបំប្លែង Logic ទៅជា Flowchart...");
      const prompt = `Convert this code into Mermaid.js flowchart syntax. 
      ONLY return the mermaid syntax starting with "graph TD". No markdown blocks.
      Code: "${data.code}"`;

      const result = await client.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });
      socket.emit("visualize_result", {
        mermaidCode:
          result.text || result.candidates?.[0]?.content?.parts?.[0]?.text,
      });
    } catch (e) {
      socket.emit("error_occured", e.message);
    }
  });

  // --- ៥. មុខងារ AI MENTAL HEALTH JOURNAL ---
socket.on("study_assist", async (data) => {
  const { content } = data;
  try {
    console.log("📚 AI កំពុងរៀបចំមេរៀនឱ្យប្អូន...");
    
    const prompt = `
      You are a brilliant and helpful Khmer Study Companion. 
      Analyze this educational content: "${content}"

      Task:
      1. Provide a concise SUMMARY of the content in Khmer.
      2. Extract 3 KEY CONCEPTS that the user must remember.
      3. Generate 3 Multiple Choice Questions (MCQ) based on the content to test the user.

      Return ONLY raw JSON:
      {
        "summary": "សេចក្ដីសង្ខេបមេរៀនជាភាសាខ្មែរ",
        "key_concepts": ["ចំនុចទី១", "ចំនុចទី២", "ចំនុចទី៣"],
        "quiz": [
          {"question": "សំណួរទី១", "options": ["A", "B", "C", "D"], "answer": "A"},
          ...
        ],
        "funny_motivation": "ពាក្យលើកទឹកចិត្តបែបកំប្លែងៗជាភាសាខ្មែរ"
      }
    `;

    // ប្រើម៉ូដែល Gemini 2.5 Flash ដែលប្អូនបានឆែកឃើញពីមុន
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash", 
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const response = JSON.parse(result.text.replace(/```json|```/g, "").trim());
    socket.emit("study_result", response);
  } catch (error) {
    
    socket.emit("error_occured", "AI វិលមុខនឹងមេរៀនបន្តិចហើយ! " + error.message);
  }
});
});

server.listen(3000, () =>
  console.log("🚀 Server is flying at http://localhost:3000"),
);
