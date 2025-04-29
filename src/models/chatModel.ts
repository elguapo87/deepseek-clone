import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    messages: [
        {
            role: { type: String, required: true },
            content: { type: String, required: true },
            timestamp: { type: Number, required: true }
        }
    ],
    userId: {
        type: String,
        required: true
    } 
}, { timestamps: true });

const chatModel = mongoose.models.chat || mongoose.model("chat", chatSchema);

export default chatModel;