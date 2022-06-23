import cors from "cors";
import "dotenv/config";
import express from "express";
import axios from "axios";

const port = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.json({ message: "Hello" });
});
app.listen(port, () => {
  console.log("backend starte");
});
