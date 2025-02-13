import prisma from "../db";
import got from "got";
import { parseFeed } from "@rowanmanning/feed-parser";

const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000);

export const populateOneFeed = async (req, res, next) => {
  const feedId = Number(req.params.id);
  const feed = await prisma.feed.findFirst({
    where: {
      id: feedId,
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
      // TODO: check if user is subbed to that feed?
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

  if (!newArticles) {
    next();
    return;
  }

  await prisma.article.createMany({
    data: newArticles,
    skipDuplicates: true,
  });

  updateLastFetchedDate(feedId);

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

    await prisma.article.createMany({
      data: newArticles,
      skipDuplicates: true,
    });

    updateLastFetchedDate(feed.id);
  });

  next();
};

async function fetchArticlesFromRSS(url: string, feedId: number) {
  try {
    const buffer = (await got(url)).body;

    const feed = parseFeed(buffer);

    const formattedItems = feed.items.map((item) => {
      return {
        feedId: feedId,
        title: item.title.toString(),
        url: item.url,
        description: item.description,
        datePublished: new Date(item.updated),
        body: item.content ?? "",
      };
    });

    return formattedItems;
  } catch (error) {
    return null;
  }
}

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
