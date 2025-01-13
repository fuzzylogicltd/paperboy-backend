import prisma from "../db";

export const addReads = async (req, res, next) => {
  const feedIds = await getFeedIds(req);
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

    next();
  });
};

const getFeedIds = async (req) => {
  if (req.params.id) {
    return [req.params.id];
  }

  const feeds = await prisma.feed.findMany({
    where: {
      subscriptions: {
        some: {
          userId: req.user.id,
        },
      },
    },
    select: {
      id: true,
    },
  });

  return feeds.map((feed) => feed.id);
};
