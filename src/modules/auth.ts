import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import config from "../config";

export const comparePasswords = (password, hash) => {
  return bcrypt.compare(password, hash);
};

export const hashPassword = (password) => {
  return bcrypt.hash(password, 5);
};

export const createJWT = (user) => {
  const token = jwt.sign(
    { id: user.id, email: user.email },
    config.secrets.jwt
  );
  return token;
};

export const protect = (req, res, next) => {
  const bearer = req.headers.authorization;

  if (!bearer) {
    res.status(401);
    res.json({ message: "Not authorized" });
    return;
  }

  const [, token] = bearer.split(" ");

  if (!token) {
    res.status(401);
    res.json({ message: "Invalid token" });
    return;
  }

  try {
    const user = jwt.verify(token, config.secrets.jwt);
    req.user = user;
    next();
  } catch (e) {
    res.status(401);
    res.json({ message: "Invalid token" });
  }
};
