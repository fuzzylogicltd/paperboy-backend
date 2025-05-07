import prisma from "../db";

// prisma find feed with given URL
// if exists, return it
// if not do a rss fetch
//   - if results not valid return error
//   - if valid create new feed (save its name as well)
//      then, add articles for that feed
//      then, return that feed

export const findOrCreateFeed = async (req, res, next) => {
  const feed = await prisma.feed.upsert({
    where: {
      url: req.body.url,
    },
    create: {
      url: req.body.url,
      name: req.body.name, // TODO: This needs to be dynamic. Make it empty here, then update on first fetch OR fetch here also?
    },
    update: {},
  });

  req.feed = feed;

  next();
};
