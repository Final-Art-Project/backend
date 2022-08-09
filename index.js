import express from "express";
import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// SETUP
const app = express();
const port = process.env.PORT || 5000;
const mongo_connect = process.env.MONGO_CONNECT;
const jwt_secret = process.env.JWT_SECRET;
const saltRounds = 10;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// MONGODB
const { Schema } = mongoose;
const userSchema = new Schema({
  name: String,
  email: { type: String, unique: true },
  password: String, // only for dev purposes
  passwordHash: String,
});
const User = mongoose.model("User", userSchema, "users");

// ROUTES
app.post("/login", async (req, res) => {
  // console.log("Request Body:", req.body);
  try {
    // FIND EMAIL IN DB
    await mongoose.connect(process.env.MONGO_CONNECTION);
    const dbUser = await User.findOne({
      email: req.body.email,
    });
    // console.log("user found in DB:", dbUser);

    // COMPARE PASSWORD HASH
    const pwdMatch = await bcrypt.compare(
      req.body.password,
      dbUser.passwordHash
    );

    if (pwdMatch) {
      // JSON WEB TOKEN (JWT) - https://www.npmjs.com/package/jsonwebtoken
      const token = jwt.sign({ name: "JWT Demo", role: "admin" }, jwt_secret, {
        // expiresIn: "2 minutes",
        expiresIn: "10 seconds",
      });
      res.json({ login: true, jwt: token, msg: "Correct Login!" });
    } else {
      res.json({
        login: false,
        jwt: false,
        msg: "Wrong username and/or password!",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/register", async (req, res) => {
  // console.log("Request Body:", req.body);
  try {
    // BCRYPT
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(req.body.password, salt);
    // console.log("bcryptHash:", hash);

    // WRITING INTO DB
    const newUser = new User({ ...req.body, passwordHash: hash });
    // console.log("newUser:", newUser);
    await mongoose.connect(mongo_connect);
    const dbUser = await newUser.save();
    // console.log("dbUser:", dbUser);
    if (dbUser) {
      res.json({ msg: "Correct Login!" });
    } else {
      res.json({
        msg: "User bereits vorhanden",
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.post("/secrets", (req, res) => {
  // console.log("Request-Token:", req.body.jwt);
  try {
    const decoded = jwt.verify(req.body.jwt, jwt_secret);
    // console.log(decoded);
    res.json({
      msg: "Hurra... gültigem Token! (Du siehst das hier nur mit gültigem Token!)",
    });
  } catch (error) {
    res.json({ msg: "Kein Geheimnis für dich. Token falsch!", error: error });
  }
});

// LISTENING
app.listen(port, () => console.log("JWT Backend listening on port:", port));
