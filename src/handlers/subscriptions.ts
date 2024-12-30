import prisma from "../db";

export const getAllSubscriptions = async (req, res) => {
  const subscriptions = await prisma.subscription.findMany({
    where: {
      userId: req.user.id,
    },
    select: {
      feedId: true,
      tags: true,
      customFeedName: true,
      feed: {
        select: {
          name: true,
          url: true,
        },
      },
    },
  });

  res.status(200);
  res.json({ data: subscriptions });
};

export const addSubscription = async (req, res) => {
  const subscription = await prisma.subscription.create({
    data: {
      userId: req.user.id,
      feedId: req.feed.id, // will be inserted by middleware
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
