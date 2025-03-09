import prisma from "../db";

export const getAllSubscriptions = async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      tags: true,
      customFeedName: true,
      feed: {
        select: {
          id: true,
          name: true,
          url: true,
          _count: {
            select: {
              articles: {
                where: {
                  reads: {
                    none: {
                      userId: req.user.id,
                      readOn: {
                        not: null,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  const subscriptionsWithUnreadCount = subscriptions.map((subscription) => ({
    ...subscription,
    unreadArticles: subscription.feed._count.articles,
  }));

  res.status(200);
  res.json({ data: subscriptionsWithUnreadCount });
};

export const addSubscription = async (req, res) => {
  const subscription = await prisma.subscription.upsert({
    where: {
      subscriptionId: {
        userId: req.user.id,
        feedId: req.feed.id,
      },
    },
    update: {
      customFeedName: req.body.customFeedName,
      tags: req.body.tags,
    },
    create: {
      userId: req.user.id,
      feedId: req.feed.id,
      customFeedName: req.body.customFeedName,
      tags: req.body.tags,
      subscribedFrom: new Date(),
    },
  });

  res.status(200);
  res.json({ data: subscription });
};

export const updateSubscription = async (req, res) => {
  const feedId = Number(req.params.id);

  const subscription = await prisma.subscription.update({
    where: {
      subscriptionId: {
        userId: req.user.id,
        feedId: feedId,
      },
    },
    data: {
      customFeedName: req.body.customFeedName,
      tags: req.body.tags,
    },
  });

  res.status(200);
  res.json({ data: subscription });
};

export const deleteSubscription = async (req, res) => {
  const feedId = Number(req.params.id);

  const subscription = await prisma.subscription.delete({
    where: {
      subscriptionId: {
        userId: req.user.id,
        feedId: feedId,
      },
    },
  });

  res.status(200);
  res.json({ data: subscription });
};
