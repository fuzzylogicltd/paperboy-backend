import prisma from "../db";

export const findOrCreateFeed = async (req, res, next) => {
  const feed = await prisma.feed.upsert({
    where: {
      url: req.body.url,
    },
    create: {
      url: req.body.url,
      name: req.body.name,
    },
    update: {},
  });

  req.feed = feed;

  next();
};
