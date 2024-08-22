const mongoose = require("mongoose");
const slugify = require("slugify");
// const validator = require("validator");
// const User = require("./userModel");
const tourSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "a Tour must have a name"],
      unique: true,
      trim: true,
      minlength: [10, "a tour name must be greater than equals to 10"],
      maxlength: [40, "a tour name must be smaller than equals to 40"],
      // validate: [validator.isAlpha, "tour name must contain only characters"],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    price: {
      type: Number,
      required: [true, "a Tour must have a price"],
    },
    duration: {
      type: Number,
      required: [true, "a Tour must have a duration"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "a Tour must have a group size"],
    },
    difficulty: {
      type: String,
      required: [true, "a Tour must have a difficulty"],
      enum: {
        values: ["easy", "medium", "difficult"],
        message: "Difficulty is either:easy,medium,difficult",
      },
    },
    ratings: {
      type: Number,
      default: 4.5,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, "a tour rating must be greater than equals to 1.0"],
      max: [5, "a tour name must be less than equals to 5.0"],
      set: (val) => Math.round(val * 10) / 10,
    },
    priceDiscount: {
      type: Number,
      validate: {
        //this->current new document not for update
        validator: function (val) {
          return val < this.price;
        },
        message: "Discount price ({VALUE}) is below regular price",
      },
    },
    summary: {
      type: String,
      trim: true, //remove whiteSpaces from beginning and end of string
      required: [true, "a tour must have a description"],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, "a tour must have a cover image"],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    //startLocation is not a document itself,is just a object describe crrtain point on earth
    startLocation: {
      //GeoJson
      type: {
        type: String,
        default: "Point",
        enum: ["Point"],
      },
      coordinates: [Number],
      address: String,
      description: String,
    },
    locations: [
      //Array with objects specify embedded documents not simple objects
      {
        //GeoJson
        type: {
          type: String,
          default: "Point",
          enum: ["Point"],
        },
        coordinates: [Number],
        address: String,
        description: String,
        ///day of tour in which people go  to this location
        day: Number,
      },
    ],
    // guides: Array,
    guides: [
      //child refrencing
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//indexing
tourSchema.index({ price: 1, ratingsAverage: 1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: "2dsphere" });

//virtual populate
tourSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "tour",
  localField: "_id",
});

tourSchema.virtual("durationWeeks").get(function () {
  return this.duration / 7;
});

//document middleware
tourSchema.pre("save", function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
//query middleware
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: "guides",
    select: "-__v -passwordChangedAt",
  });
  next();
});

// tourSchema.pre("aggregate", function (next) {
//   this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
//   next();
// });

//Embedding
// tourSchema.pre("save", async function (next) {
//   const guidesPromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
// });

const Tour = mongoose.model("Tour", tourSchema);
module.exports = Tour;
