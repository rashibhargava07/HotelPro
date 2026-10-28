import { Review } from '../models/Review.js';
import { Booking } from '../models/Booking.js';
import { Hotel } from '../models/Hotel.js';

export const getHotelReviews = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const reviews = await Review.find({ hotelId }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

export const createReview = async (req, res, next) => {
  try {
    const { hotelId, bookingId, rating, title, comment, subRatings } = req.body;

    if (!hotelId || !bookingId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'hotelId, bookingId, rating, title, and comment are required.',
      });
    }

    // Security & Verification Rule: The guest must have a concluded (checked_out) stay
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Reservation not found.' });
    }

    if (booking.guestId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only review your own stays.',
      });
    }

    if (booking.bookingStatus !== 'checked_out') {
      return res.status(400).json({
        success: false,
        message: 'Reviews can only be posted after your stay has concluded (checked_out).',
      });
    }

    // Check if review already exists for this booking
    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'A review has already been submitted for this concluded reservation.',
      });
    }

    const stayMonthYear = new Date(booking.checkOut).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    const review = await Review.create({
      hotelId,
      bookingId,
      guestId: req.user._id,
      guestName: req.user.name,
      guestAvatar: req.user.avatarUrl || '',
      roomCategoryName: booking.roomDetailsSnapshot?.categoryName || 'Deluxe Chamber',
      rating,
      subRatings: subRatings || { cleanliness: 5, hospitality: 5, comfort: 5, dining: 5 },
      title,
      comment,
      stayDate: stayMonthYear,
      isVerifiedStay: true,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for your review. Your ratings have been recorded.',
      review,
    });
  } catch (error) {
    next(error);
  }
};

export const addManagementResponse = async (req, res, next) => {
  try {
    const { reviewId } = req.params;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ success: false, message: 'Response comment is required.' });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found.' });
    }

    review.managementResponse = {
      authorName: req.user.name,
      responseDate: new Date(),
      comment,
    };
    await review.save();

    res.json({
      success: true,
      message: 'Management response published successfully.',
      review,
    });
  } catch (error) {
    next(error);
  }
};
