import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import morgan from "morgan";
import cors from "cors";

import router from "./router";
import { createNewUser, activateUser, signIn } from "./handlers/users";
import { protect } from "./modules/auth";

const app = express();

const corsOptions = {
  origin: true,
  credentials: true,
};

const accessLogStream = fs.createWriteStream(
  path.join(path.dirname(fileURLToPath(import.meta.url)), "access.log"),
  { flags: "a" }
);
app.use(morgan("combined", { stream: accessLogStream }));

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200);
  res.json({ message: "hello" });
});

app.post("/", (req, res) => {
  res.status(200);
  res.json({ message: "hello as post" });
});

app.use("/api", protect, router);
app.post("/user", createNewUser);
app.post("/user/activate", activateUser);
app.post("/signin", signIn);

export default app;
