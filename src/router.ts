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

const router = Router();

// Get all from Read+Article (desc, paginated) = Title, URL, DatePublished, Image, ReadOn, Starred
// GET /articles
router.get("/articles", populateManyFeeds, getAllArticles);

// Get all from Read+Article by FeedId (desc, paginated) = Title, URL, DatePublished, Image, ReadOn, Starred
// GET /articles/feed/:id
router.get("/articles/feed/:id", populateOneFeed, getArticlesByFeed);

// Get single Article by ArticleId
// GET /articles/:id
router.get("/articles/:id", getArticle);

// Put to Read - set ReadOn/Starred
// PUT /articles/:id
router.put("/articles/:id", updateArticle);

// ---

// Get all Subscriptions (+feed info) = FeedId, Name, URL, Tags
// GET /subscriptions
router.get("/subscriptions", getAllSubscriptions);

// Post to Subscription (add Sub) - send URL, Tags, CustomFeedName
// POST /subscriptions/:id
router.post("/subscriptions", findOrCreateFeed, addSubscription);

// Put to Subscription (edit Sub) - send URL, Tags, CustomFeedName
// PUT /subscriptions/:id
router.put("/subscriptions/:id", updateSubscription);

// Delete subscription by id
// DELETE /subscriptions/:id
router.delete("/subscriptions/:id", deleteSubscription);

export default router;
