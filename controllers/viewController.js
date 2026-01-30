
const path = require("path");

exports.getIndex = (req, res) => {
    res.render("index", { title: "AI Reviewer", pageKey: "reviewer", theme: "#00f2ff" }); // ពណ៌ Cyan
};

exports.getCulture = (req, res) => {
    res.render("culture", { title: "Khmer Culture", pageKey: "culture", theme: "#ffd700" }); // ពណ៌មាស
};

exports.getVisualizer = (req, res) => {
    res.render("visualizer", { title: "Logic Visualizer", pageKey: "visualizer", theme: "#a855f7" }); // ពណ៌ស្វាយ
};

exports.getStudyBuddy = (req, res) => {
    res.render("study-buddy", { title: "Study Buddy", pageKey: "study", theme: "#22c55e" }); // ពណ៌បៃតង
};

exports.getKida = (req, res) => {
    res.render("kida", { title: "K-IDA AI", pageKey: "kida", theme: "#ef4444" }); // ពណ៌ក្រហម
};

exports.getTutor = (req, res) => {
    res.render("tutor", { title: "AI Tutor", pageKey: "tutor", theme: "#38bdf8" }); // ពណ៌ Cyan ភ្លឺ
};