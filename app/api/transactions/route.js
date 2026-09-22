import { connectDB } from "@/lib/dbConnect";
import Transaction from "@/models/Transaction";

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error("DB connection failed:", error);
    return res.status(500).json({ message: "Failed to connect to the database" });
  }

  if (req.method === "GET") {
    try {
      const data = await Transaction.find().sort({ createdAt: -1 });
      return res.status(200).json(data);
    } catch (error) {
      console.error("GET error:", error);
      return res.status(500).json({ message: "Error fetching data" });
    }
  }

  if (req.method === "POST") {
    try {
      const { name, amount, type } = req.body;

      if (!name || !amount || !type) {
        return res.status(400).json({ message: "All fields are required" });
      }

      const newItem = await Transaction.create({
        name,
        amount: Number(amount),
        type,
      });

      return res.status(201).json(newItem);
    } catch (error) {
      console.error("POST error:", error);
      return res.status(500).json({ message: "Error creating transaction" });
    }
  }

  return res.status(405).json({ message: "Method not allowed" });
}