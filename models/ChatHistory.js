const mongoose = require("mongoose");

const ChatHistorySchema = new mongoose.Schema({
    toolName: { type: String, required: true }, // Reviewer, Tutor, K-IDA...
    userInput: { type: String, required: true },
    aiResponse: { type: Object, required: true }, // រក្សាទុក JSON ទាំងមូលពី AI
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ChatHistory", ChatHistorySchema);