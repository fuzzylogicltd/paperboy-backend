import prisma from "../db";

const ITEMS_PER_PAGE = 10;

export const getAllArticles = async (req, res) => {
  const queryPageCursor = Number(req.query.pageCursor);
  const pageCursor = queryPageCursor ?? 0;
  const starred = req.query.starred ?? null;
  const read = req.query.read ?? null;

  const reads = await prisma.read.findMany({
    take: ITEMS_PER_PAGE,
    ...(pageCursor && {
      skip: pageCursor ? 1 : 0,
      cursor: {
        readId: {
          userId: req.user.id,
          articleId: pageCursor,
        },
      },
    }),
    where: {
      userId: req.user.id,
      ...(starred !== null && { starred: starred === "true" }),
      ...(read !== null && { readOn: read === "true" ? { not: null } : null }),
    },
    select: {
      starred: true,
      readOn: true,
      article: {
        include: {
          feed: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      article: {
        datePublished: "desc",
      },
    },
  });

  const formattedReads = reads.map((read) => ({
    starred: read.starred,
    read: !!read.readOn,
    article: read.article,
  }));

  const lastPostInResults = formattedReads[ITEMS_PER_PAGE - 1];

  res.status(200);
  res.json({
    data: formattedReads,
    pageCursor: lastPostInResults?.article.id ?? null,
  });
};

export const getArticlesByFeed = async (req, res) => {
  const feedId = Number(req.params.id);
  const queryPageCursor = Number(req.query.pageCursor);
  const pageCursor = queryPageCursor ?? 0;
  const starred = req.query.starred ?? null;
  const read = req.query.read ?? null;

  const reads = await prisma.read.findMany({
    take: ITEMS_PER_PAGE,
    ...(pageCursor && {
      skip: pageCursor ? 1 : 0,
      cursor: {
        readId: {
          userId: req.user.id,
          articleId: pageCursor,
        },
      },
    }),
    where: {
      userId: req.user.id,
      article: {
        feedId: feedId,
      },
      ...(starred !== null && { starred: starred === "true" }),
      ...(read !== null && { readOn: read === "true" ? { not: null } : null }),
    },
    select: {
      starred: true,
      readOn: true,
      article: {
        include: {
          feed: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      article: {
        datePublished: "desc",
      },
    },
  });

  const formattedReads = reads.map((read) => ({
    starred: read.starred,
    read: !!read.readOn,
    article: read.article,
  }));

  const lastPostInResults = formattedReads[ITEMS_PER_PAGE - 1];

  res.status(200);
  res.json({
    data: formattedReads,
    pageCursor: lastPostInResults?.article.id ?? null,
  });
};

export const getArticle = async (req, res) => {
  const articleId = Number(req.params.id);

  const reads = await prisma.read.findFirst({
    where: {
      userId: req.user.id,
      articleId: articleId,
    },
    include: {
      article: {
        include: {
          feed: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  res.status(200);
  res.json({ data: reads });
};

export const updateArticle = async (req, res) => {
  const articleId = Number(req.params.id);

  const updatedRead = await prisma.read.update({
    where: {
      readId: {
        userId: req.user.id,
        articleId: articleId,
      },
    },
    data: {
      starred: req.body.starred,
      readOn: new Date(Date.now()),
    },
  });

  res.json({ data: updatedRead });
};
