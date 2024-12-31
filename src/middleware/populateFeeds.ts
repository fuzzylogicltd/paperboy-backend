import prisma from "../db";

export const populateOneFeed = async (req, res, next) => {
  const feed = await prisma.feed.findFirst({
    where: {
      id: Number(req.params.id),
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

  const newArticles = await fetchArticlesFromRSS(feed.url);

  // insert new articles into articles

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
    const newArticles = await fetchArticlesFromRSS(feed.url);

    // insert
  });

  next();
};

async function fetchArticlesFromRSS(url) {
  console.log("fetching " + url);
}
