import { Router } from "express";

import {
  getArticlesByFeed,
  getAllArticles,
  getArticle,
  updateArticle,
} from "./handlers/articles";
import {
  addSubscription,
  deleteSubscription,
  getAllSubscriptions,
  updateSubscription,
} from "./handlers/subscriptions";
import { findOrCreateFeed } from "./middleware/findOrCreateFeed";
import { populateManyFeeds, populateOneFeed } from "./middleware/populateFeeds";
import { addReads } from "./middleware/addReads";

const router = Router();

router.get("/articles", populateManyFeeds, addReads, getAllArticles);
router.get("/articles/feed/:id", populateOneFeed, addReads, getArticlesByFeed);
router.get("/articles/:id", getArticle);
router.put("/articles/:id", updateArticle);

router.get("/subscriptions", getAllSubscriptions);
router.post("/subscriptions", findOrCreateFeed, addSubscription);
router.put("/subscriptions/:id", updateSubscription);
router.delete("/subscriptions/:id", deleteSubscription);

export default router;
