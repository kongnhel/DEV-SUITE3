require("dotenv").config();
const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const viewRoutes = require("./routes/viewRoutes");
const aiHandler = require("./controllers/aiController");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// Middleware & Routes
app.use(express.static("public")); // បើមាន CSS/JS file
app.use("/", viewRoutes);

// --- កំណត់ View Engine ---
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // ប្រាប់ថា File .ejs នៅកន្លែងណា
// Socket Connection
io.on("connection", (socket) => {
  aiHandler(socket); // ហៅ AI Controller មកប្រើ
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server is flying at http://localhost:${PORT}`);
});
