import express from "express";
import morgan from "morgan";

import router from "./router";
import { createNewUser, signIn } from "./handlers/users";
import { protect } from "./modules/auth";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  console.log("hello from express");
  res.status(200);
  res.json({ message: "hello" });
});

app.use("/api", protect, router);
app.post("/user", createNewUser);
app.post("/signin", signIn);

export default app;
