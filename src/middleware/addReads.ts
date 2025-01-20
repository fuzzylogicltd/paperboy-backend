import prisma from "../db";

export const addReads = async (req, res, next) => {
  const feedIds = await getFeedIdForCurrentUser(req);
  const userId = req.user.id;

  feedIds.forEach(async (feedId) => {
    const articles = await prisma.article.findMany({
      where: {
        feedId: feedId,
        retrievedAt: {
          gt: (
            await prisma.subscription.findFirst({
              where: {
                feedId: feedId,
                userId: userId,
              },
              select: {
                subscribedFrom: true,
              },
            })
          ).subscribedFrom,
        },
      },
    });

    const readData = articles.map((article) => ({
      articleId: article.id,
      userId: userId,
    }));

    await prisma.read.createMany({
      data: readData,
      skipDuplicates: true,
    });
  });

  next();
};

const getFeedIdForCurrentUser = async (req) => {
  const feedId = Number(req.params.id);

  // if we have feedId from query params we still run it through a query to
  // make sure the user is subscribed to it, otherwise they shouldn't have access
  // And if there's no feedId in the query, we return all subscriptions for that user

  const feeds = await prisma.feed.findMany({
    where: {
      subscriptions: {
        some: {
          userId: req.user.id,
          ...(feedId && {
            feedId: feedId,
          }),
        },
      },
    },
    select: {
      id: true,
    },
  });

  return feeds.map((feed) => feed.id);
};
