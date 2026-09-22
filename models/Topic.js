import mongoose from "mongoose";

const TopicSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
});

export default mongoose.models.Topic || mongoose.model("Topic", TopicSchema);