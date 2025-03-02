import got from "got";
import { parseFeed } from "@rowanmanning/feed-parser";

export async function fetchArticlesFromRSS(url: string, feedId: number) {
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
        imageUrl: item.image?.url,
        author: item.authors.map((author) => author.name).toString(),
      };
    });

    return formattedItems;
  } catch (error) {
    return null;
  }
}
