import { Router } from "express";

import {
  getArticlesByFeed,
  getAllArticles,
  getArticle,
  updateArticle,
} from "./handlers/articles";

const router = Router();

// Get all from Read+Article (desc, paginated) = Title, URL, DatePublished, Image, ReadOn, Starred
// GET /articles
router.get("/articles", getAllArticles);

// Get all from Read+Article by FeedId (desc, paginated) = Title, URL, DatePublished, Image, ReadOn, Starred
// GET /articles/feed/:id
router.get("/articles/feed/:id", getArticlesByFeed);

// Get single Article by ArticleId
// GET /articles/:id
router.get("/articles/:id", getArticle);

// Put to Read - set ReadOn/Starred
// PUT /articles/:id
router.put("/articles/:id", updateArticle);

// ---

// Get all Subscriptions (+feed info) = FeedId, Name, URL, Tags
// GET /subscriptions

// Post to Subscription (add Sub) - send URL, Tags, CustomFeedName
// POST /subscriptions/:id

// Put to Subscription (edit Sub) - send URL, Tags, CustomFeedName
// PUT /subscriptions/:id

// Delete subscription by id
// DELETE /subscriptions/:id

export default router;
