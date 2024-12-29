import { PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";
const prisma = new PrismaClient();

function getRandom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

async function main() {
  console.log("Seeding...");

  // Delete old
  await prisma.read.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.article.deleteMany();
  await prisma.feed.deleteMany();

  // Users
  const users = await prisma.user.findMany();
  const userIds = users.map((user) => user.id);

  // Feeds
  const feedIds = [];
  for (let i = 0; i < 20; i++) {
    const feed = await prisma.feed.create({
      data: {
        name: faker.book.title(),
        url: faker.internet.url(),
      },
    });
    feedIds.push(feed.id);
  }

  // Articles
  const articleIds = [];
  for (let i = 0; i < 200; i++) {
    const article = await prisma.article.create({
      data: {
        title: faker.lorem.words({ min: 3, max: 12 }),
        datePublished: faker.date.recent(),
        body: faker.lorem.paragraphs({ min: 3, max: 12 }),
        url: faker.internet.url(),
        imageUrl: faker.internet.url(),
        feedId: getRandom(feedIds),
      },
    });
    articleIds.push(article.id);
  }

  // Subscriptions
  for (let i = 0; i < 20; i++) {
    const randomUserId = getRandom(userIds);
    const randomFeedId = getRandom(feedIds);

    await prisma.subscription.upsert({
      where: {
        subscriptionId: {
          userId: randomUserId,
          feedId: randomFeedId,
        },
      },
      update: {},
      create: {
        userId: randomUserId,
        feedId: randomFeedId,
      },
    });
  }

  // Reads
  for (let i = 0; i < 80; i++) {
    const randomUserId = getRandom(userIds);
    const randomArticleId = getRandom(articleIds);

    await prisma.read.upsert({
      where: {
        readId: {
          userId: randomUserId,
          articleId: randomArticleId,
        },
      },
      update: {},
      create: {
        userId: randomUserId,
        articleId: randomArticleId,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
