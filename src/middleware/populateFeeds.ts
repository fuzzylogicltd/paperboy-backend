import { Article } from "@prisma/client";
import prisma from "../db";
import { XMLParser } from "fast-xml-parser";
import got from "got";

const FIVE_MINUTES_AGO = new Date(Date.now() - 5 * 60 * 1000);

export const populateOneFeed = async (req, res, next) => {
  const feedId = Number(req.params.id);
  const feed = await prisma.feed.findFirst({
    where: {
      id: feedId,
      lastFetched: {
        lte: FIVE_MINUTES_AGO,
      },
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

  if (feed) {
    const newArticles = await fetchArticlesFromRSS(feed.url, feedId);

    await prisma.article.createMany({
      data: newArticles,
      skipDuplicates: true,
    });

    updateLastFetchedDate(feedId);
  }

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

async function fetchArticlesFromRSS(
  url: string,
  feedId: number
): Promise<Article[]> {
  const buffer = await got(url).buffer();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const feed = await parser.parse(buffer);

  let items = [];

  // TODO: refactor below this line ------

  if (feed.feed) {
    // atom
    items = feed.feed.entry;
  } else {
    // rss
    items = feed.rss.channel.item;
  }

  const formattedItems = items.map((item) => {
    const formattedDate = new Date(item.pubDate ?? item.updated);

    return {
      feedId: feedId,
      title: item.title,
      url: item.link["@_href"] ?? item.link,
      description: item.description ?? "",
      datePublished: formattedDate,
      body: item["content:encoded"] ?? item.summary["#text"] ?? "",
    };
  });

  return formattedItems;
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
