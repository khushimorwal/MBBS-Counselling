const express = require("express");
const router = express.Router();

const Auth = require("../Auth");

const {
  createRecommendation,
  updateRecommendation,
  shareRecommendation,
  getMyRecommendations,
  getRecommendationByRequest,
} = require("../CONTROLLERS/CollegeRecommendationController");

router.post("/draft", Auth, createRecommendation);

router.put("/draft/:id", Auth, updateRecommendation);

router.patch("/share/:id", Auth, shareRecommendation);

router.get("/my-recommendations", Auth, getMyRecommendations);

router.get(
  "/request/:counsellingRequest",
  Auth,
  getRecommendationByRequest
);

module.exports = router;