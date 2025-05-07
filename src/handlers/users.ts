import crypto from "crypto";

import prisma from "../db";
import { comparePasswords, createJWT, hashPassword } from "../modules/auth";
import sendEmail from "../modules/sendEmail";

export const createNewUser = async (req, res) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: req.body.email,
    },
  });

  if (existingUser) {
    res.status(400);
    res.json({ message: "Email already in use" });
    return;
  }

  const activationCode = crypto.randomUUID().toString().replaceAll("-", "");

  await prisma.user.create({
    data: {
      email: req.body.email,
      password: await hashPassword(req.body.password),
      activationCode: activationCode,
    },
  });

  const appUrl = req.protocol + "://" + req.get("host");

  const activationUrl = appUrl + "/user/activate/" + activationCode;

  const recipient = "lazar@fuzzylogic.ltd";
  const subject = "Please activate your account";
  const templateName = "activate";
  const payload = {
    userName: "Lazar",
    activationUrl: activationUrl,
  };

  // send confirmation email
  sendEmail(recipient, subject, templateName, payload);

  res.json({ message: "User created" });
};

export const activateUser = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: {
      email: req.body.email,
      activationCode: req.body.activationCode,
      active: false,
      // TODO: limit to only users created in the past 7 days or something
    },
  });

  if (!user) {
    res.status(400);
    res.json({
      message:
        "Activation code is invalid, expired, or the user does not exist",
    });
    return;
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      active: true,
    },
  });

  res.status(200);
  res.json("User successfully activated");
};

export const signIn = async (req, res) => {
  const user = await prisma.user.findFirst({
    where: {
      email: req.body.email,
      active: true,
    },
  });

  if (!user) {
    res.status(401);
    res.json({ message: "Unauthorized" });
    return;
  }

  const isValid = await comparePasswords(req.body.password, user.password);

  if (!isValid) {
    res.status(401);
    res.json({ message: "Unauthorized" });
    return;
  }

  const token = createJWT(user);
  res.status(200);
  res.json({ access_token: token });
};
