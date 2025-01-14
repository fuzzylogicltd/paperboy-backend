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

const FEED_FORMAT = {
  rss: "rss",
  rdf: "rdf",
  atom: "atom",
};

async function fetchArticlesFromRSS(url: string, feedId: number) {
  const buffer = await got(url).buffer();

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  const feed = await parser.parse(buffer);

  let items = [];
  let feedFormat = "unknown";

  if (feed.feed) {
    feedFormat = FEED_FORMAT.atom;
  } else if (feed.rss) {
    feedFormat = FEED_FORMAT.rss;
  } else if (feed.rdf) {
    feedFormat = FEED_FORMAT.rdf;
  }

  switch (feedFormat) {
    case FEED_FORMAT.atom:
      items = feed.feed.entry;
      break;
    case FEED_FORMAT.rss:
      items = feed.rss.channel.item;
      break;
    case FEED_FORMAT.rdf:
      items = feed.rdf.channel.item;
      break;
    case "unknown":
      throw new Error("Unrecognized feed format on " + url);
  }

  const formattedItems = items.map((item) => {
    if (feedFormat === FEED_FORMAT.atom) {
      return {
        feedId: feedId,
        title: item.title.toString(),
        url: item.link["@_href"],
        description: "", // atom feeds don't provide item description
        datePublished: new Date(item.updated),
        body: item.summary["#text"] ?? "",
      };
    }

    return {
      feedId: feedId,
      title: item.title.toString(),
      url: item.link,
      description: item.description ?? "",
      datePublished: new Date(item.pubDate),
      body: item["content:encoded"] ?? "",
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
