import prisma from "../db";
import { fetchArticlesFromRSS } from "../modules/fetchRss";

const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000);

export const populateOneFeed = async (req, res, next) => {
  const feedId = Number(req.params.id);
  const feed = await prisma.feed.findFirst({
    where: {
      id: feedId,
      subscriptions: {
        some: {
          userId: req.user.id,
        },
      },
      OR: [
        {
          lastFetched: {
            lte: FIVE_MINUTES_AGO,
          },
        },
        {
          lastFetched: null,
        },
      ],
    },
    select: {
      url: true,
      articles: {
        orderBy: {
          datePublished: "desc",
        },
        take: 1,
        select: {
          datePublished: true,
        },
      },
    },
  });

  if (!feed) {
    next();
    return;
  }

  const newArticles = await fetchArticlesFromRSS(feed.url, feedId);

  updateLastFetchedDate(feedId);

  if (!newArticles) {
    next();
    return;
  }

  await prisma.article.createMany({
    data: newArticles,
    skipDuplicates: true,
  });

  next();
};

export const populateManyFeeds = async (req, res, next) => {
  const feeds = await prisma.feed.findMany({
    where: {
      subscriptions: {
        some: {
          userId: req.user.id,
        },
      },
      lastFetched: {
        lte: FIVE_MINUTES_AGO,
      },
    },
    select: {
      id: true,
      url: true,
      articles: {
        orderBy: {
          datePublished: "desc",
        },
        take: 1,
        select: {
          datePublished: true,
        },
      },
    },
  });

  feeds.forEach(async (feed) => {
    const newArticles = await fetchArticlesFromRSS(feed.url, feed.id);

    updateLastFetchedDate(feed.id);

    if (!newArticles) {
      return;
    }

    await prisma.article.createMany({
      data: newArticles,
      skipDuplicates: true,
    });
  });

  next();
};

async function updateLastFetchedDate(feedId) {
  await prisma.feed.update({
    where: {
      id: feedId,
    },
    data: {
      lastFetched: new Date(),
    },
  });
}
