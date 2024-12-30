import prisma from "../db";

export const findOrCreateFeed = async (req, res, next) => {
  const existingFeed = await prisma.feed.findFirst({
    select: {
      url: req.body.url,
    },
  });

  if (!existingFeed) {
    const newFeed = await prisma.feed.create({
      data: {
        url: req.body.url,
        name: req.body.name,
      },
    });

    req.feed = newFeed;
  } else {
    req.feed = existingFeed;
  }

  next();
};
