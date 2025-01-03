import prisma from "../db";
import { XMLParser } from "fast-xml-parser";
import got from "got";

export const populateOneFeed = async (req, res, next) => {
  const feedId = Number(req.params.id);
  const feed = await prisma.feed.findFirst({
    where: {
      id: feedId,
      // TODO: add rate limit based on last fetched date
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

  const newArticles = await fetchArticlesFromRSS(feed.url, feedId);

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
      // TODO: add rate limit based on last fetched date
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
  });

  next();
};

async function fetchArticlesFromRSS(url, feedId) {
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
