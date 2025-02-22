import prisma from "../db";
import { comparePasswords, createJWT, hashPassword } from "../modules/auth";

export const createNewUser = async (req, res) => {
  const user = await prisma.user.create({
    data: {
      email: req.body.email,
      password: await hashPassword(req.body.password),
    },
  });

  const token = createJWT(user);
  res.json({ token });
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
