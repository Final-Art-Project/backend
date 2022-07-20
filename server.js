import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import express from "express";
import axios from "axios";
// import { json } from "body/parser";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const app = express();
app.use(cors());
// app.use(json());
const { parsed: config } = dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "DEV",
    resource_type: "auto",
  },
});
const upload = multer({ storage });

app.get("/", function (req, res) {
  res.json({ msg: "up and running" });
});

app.post("/upload", upload.single("file"), (req, res) => {
  console.log("/upload called");
  console.log(req.file);
  console.log(req.body);
  return res.json({ image: req.file.path });
});

const BASE_URL = `https://api.cloudinary.com/v1_1/${config.CLOUD_NAME}`;

const auth = {
  username: config.API_KEY,
  password: config.API_SECRET,
};

app.get("/photos", async (req, res) => {
  const response = await axios.get(BASE_URL + "/resources/image", {
    auth,
    params: {
      next_cursor: req.query.next_cursor,
    },
  });
  return res.send(response.data);
});

app.get("/search", async (req, res) => {
  const response = await axios.get(BASE_URL + "/resources/search", {
    auth,
    params: {
      expression: req.query.expression,
    },
  });

  return res.send(response.data);
});

app.listen(process.env.PORT || 3000, function () {
  console.log("listening on *:3000");
});
// const PORT = 3000;

// app.listen(PORT, console.log(`index running on port ${PORT}`));
