const express = require("express");
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  // checkBody,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getToursWithin,
  getDistances,
  // checkId,
} = require("../controllers/tourController");
const reviewRouter = require("./reviewRoute");
const { protect, restrictTo } = require("../controllers/authController");
const router = express.Router();
router.use("/:tourId/reviews", reviewRouter);

// router.param("id", checkId);   ->tourController-v1
// router.route("/").get(getAllTours).post(checkBody, createTour);  ->checkBody->tourController-v1
router.route("/top-5-cheap").get(aliasTopTours, getAllTours);
router.route("/tour-stats").get(getTourStats);
router
  .route("/monthly-plan/:year")
  .get(protect, restrictTo("admin", "lead-guide", "guide"), getMonthlyPlan);

router
  .route("/tours-within/:distance/center/:latlng/unit/:unit")
  .get(getToursWithin);

router.route("/distances/:latlng/unit/:unit").get(getDistances);

router
  .route("/")
  .get(getAllTours)
  .post(protect, restrictTo("admin", "lead-guide"), createTour);
router
  .route("/:id")
  .get(getTour)
  .patch(protect, restrictTo("admin"), updateTour)
  .delete(protect, restrictTo("admin"), deleteTour);

module.exports = router;
