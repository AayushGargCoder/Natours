const { mongoose } = require("mongoose");
const Tour = require("./tourModel");

const reviewSchema = mongoose.Schema(
  {
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      required: [true, "A Review cannot be empty"],
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: "Tour",
      required: [true, "A Review must belong to tour"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "A Review must belong to a user"],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: "tour",
    select: "name",
  }).populate({
    path: "user",
    select: "name photo",
  });
  // this.populate({
  //   path: "user",
  //   select: "name photo",
  // });
  next();
});
//calculate ratingsAverage for a tour
reviewSchema.statics.calcAverage = async function (tourId) {
  //find all reviews with tourId
  const stats = await this.aggregate([
    {
      //find all reviews with tourId
      $match: { tour: tourId },
    },
    //calculate statistics for all reviews for common tour
    {
      $group: {
        _id: "$tour",
        nRating: { $sum: 1 },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);
  if (stats.length)
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
};
//combination of tour and user be unique,a user not post more than one review on same tour
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.post("save", function () {
  //this->doc
  this.constructor.calcAverage(this.tour);
});
// reviewSchema.pre(/^findOneAnd/, async function (next) {
//   //this->query but we require document because we want tourId
//   //we cannot use post here because then query already execute, so  we dont have acces to query
//   this.revDoc = await this.findOne();
//   next();
// });
reviewSchema.post(/^findOneAnd/, async function (doc) {
  await doc.constructor.calcAverage(doc.tour._id);
});
const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;
