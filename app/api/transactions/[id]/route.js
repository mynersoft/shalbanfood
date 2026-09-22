import { connectDB } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";

export default async function handler(req, res) {
  await connectDB();
  const { id } = req.query;

  if (req.method === "GET") {
    const item = await Transaction.findById(id);
    return res.status(200).json(item);
  }

  if (req.method === "PUT") {
    const updated = await Transaction.findByIdAndUpdate(id, req.body, { new: true });
    return res.status(200).json(updated);
  }

  if (req.method === "DELETE") {
    const removed = await Transaction.findByIdAndDelete(id);
    return res.status(200).json(removed);
  }

  res.status(405).json({ message: "Method not allowed" });
}