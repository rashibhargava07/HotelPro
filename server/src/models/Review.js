import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema(
  {
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      required: true,
      index: true,
    },
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
      unique: true, // One review per concluded booking
      index: true,
    },
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    guestName: {
      type: String,
      required: true,
      trim: true,
    },
    guestAvatar: {
      type: String,
      default: '',
    },
    roomCategoryName: {
      type: String,
      default: 'Royal Chamber',
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    subRatings: {
      cleanliness: { type: Number, min: 1, max: 5, default: 5 },
      hospitality: { type: Number, min: 1, max: 5, default: 5 },
      comfort: { type: Number, min: 1, max: 5, default: 5 },
      dining: { type: Number, min: 1, max: 5, default: 5 },
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    stayDate: {
      type: String,
      required: true,
    },
    isVerifiedStay: {
      type: Boolean,
      default: true,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
    managementResponse: {
      authorName: { type: String },
      responseDate: { type: Date },
      comment: { type: String, maxlength: 1000 },
    },
  },
  { timestamps: true }
);

// Compound index to quickly fetch reviews for a hotel ordered by date
reviewSchema.index({ hotelId: 1, createdAt: -1 });

// Static method to recalculate hotel rating after review submission or edit
reviewSchema.statics.calcAverageRatings = async function (hotelId) {
  const stats = await this.aggregate([
    { $match: { hotelId: new mongoose.Types.ObjectId(hotelId) } },
    {
      $group: {
        _id: '$hotelId',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  const Hotel = mongoose.model('Hotel');
  if (stats.length > 0) {
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].nRatings,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      rating: 5.0,
      reviewCount: 0,
    });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRatings(this.hotelId);
});

export const Review = mongoose.model('Review', reviewSchema);
