import prisma from "../db";

const PAGE_SIZE = 10;

export const getAllArticles = async (req, res) => {
  const pageCursor = req.body.pageCursor;

  const reads = await prisma.read.findMany({
    take: PAGE_SIZE,
    skip: pageCursor ? 1 : 0,
    cursor: {
      readId: {
        userId: req.user.id,
        articleId: pageCursor,
      },
    },
    where: {
      userId: req.user.id,
    },
    include: {
      article: true,
    },
  });

  const lastPostInResults = reads[PAGE_SIZE - 1];

  res.status(200);
  res.json({ data: reads, pageCursor: lastPostInResults.articleId });
};

export const getArticlesByFeed = async (req, res) => {
  const feedId = Number(req.params.id);

  const reads = await prisma.read.findMany({
    where: {
      userId: req.user.id,
      article: {
        feedId: feedId,
      },
    },
    include: {
      article: true,
    },
  });

  res.status(200);
  res.json({ data: reads });
};

export const getArticle = async (req, res) => {
  const articleId = Number(req.params.id);

  const reads = await prisma.read.findFirst({
    where: {
      userId: req.user.id,
      articleId: articleId,
    },
    include: {
      article: true,
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
      readOn: null,
    },
  });

  res.json({ data: updatedRead });
};
