import React, { useState, useMemo } from 'react';
import { useHotelProStore } from '../../hooks/useHotelProStore';
import { Review, ReviewSubRatings, Booking } from '../../types';
import {
  Star,
  CheckCircle2,
  Sparkles,
  ThumbsUp,
  MessageSquare,
  ShieldCheck,
  Send,
  Filter,
  UserCheck,
  Building,
  AlertCircle,
  Clock,
  ArrowRight,
  Heart,
} from 'lucide-react';

interface ReviewSectionProps {
  hotelId: string;
}

export const ReviewSection: React.FC<ReviewSectionProps> = ({ hotelId }) => {
  const { currentUser, reviews, hotels, bookings, actions } = useHotelProStore();

  const hotel = hotels.find((h) => h.id === hotelId) || hotels[0];
  const hotelReviews = useMemo(() => {
    return reviews.filter((r) => r.hotelId === hotelId);
  }, [reviews, hotelId]);

  // Check if current user has an eligible concluded stay
  const eligibleBookings = useMemo(() => {
    return actions.getEligibleConcludedBookingsForGuest(hotelId);
  }, [actions, hotelId, currentUser.id, bookings, reviews]);

  // Form State
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string>(eligibleBookings[0]?.id || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [subRatings, setSubRatings] = useState<ReviewSubRatings>({
    cleanliness: 5,
    hospitality: 5,
    comfort: 5,
    dining: 5,
  });
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Management Reply state
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [managementComment, setManagementComment] = useState('');

  // Filters & Sorting
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'highest'>('recent');

  // Rating labels
  const ratingLabels: Record<number, string> = {
    5: 'Exceptional (5/5)',
    4: 'Very Good (4/5)',
    3: 'Average (3/5)',
    2: 'Disappointing (2/5)',
    1: 'Poor (1/5)',
  };

  // Calculate rating statistics
  const stats = useMemo(() => {
    const total = hotelReviews.length;
    if (total === 0) {
      return {
        avgRating: 5.0,
        distribution: { 5: 100, 4: 0, 3: 0, 2: 0, 1: 0 },
        subAvgs: { cleanliness: 5.0, hospitality: 5.0, comfort: 5.0, dining: 5.0 },
      };
    }

    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let sumTotal = 0;
    let sumClean = 0;
    let sumHosp = 0;
    let sumComfort = 0;
    let sumDining = 0;

    hotelReviews.forEach((r) => {
      const star = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[star] = (counts[star] || 0) + 1;
      sumTotal += r.rating;

      if (r.subRatings) {
        sumClean += r.subRatings.cleanliness;
        sumHosp += r.subRatings.hospitality;
        sumComfort += r.subRatings.comfort;
        sumDining += r.subRatings.dining;
      } else {
        sumClean += r.rating;
        sumHosp += r.rating;
        sumComfort += r.rating;
        sumDining += r.rating;
      }
    });

    return {
      avgRating: Math.round((sumTotal / total) * 10) / 10,
      distribution: {
        5: Math.round((counts[5] / total) * 100),
        4: Math.round((counts[4] / total) * 100),
        3: Math.round((counts[3] / total) * 100),
        2: Math.round((counts[2] / total) * 100),
        1: Math.round((counts[1] / total) * 100),
      },
      subAvgs: {
        cleanliness: Math.round((sumClean / total) * 10) / 10,
        hospitality: Math.round((sumHosp / total) * 10) / 10,
        comfort: Math.round((sumComfort / total) * 10) / 10,
        dining: Math.round((sumDining / total) * 10) / 10,
      },
    };
  }, [hotelReviews]);

  // Filtered & Sorted Reviews
  const displayedReviews = useMemo(() => {
    let list = [...hotelReviews];
    if (filterRating !== 'all') {
      list = list.filter((r) => Math.round(r.rating) === filterRating);
    }
    if (sortBy === 'recent') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      list.sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [hotelReviews, filterRating, sortBy]);

  // Handle Review Submission
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const targetBookingId = selectedBookingId || eligibleBookings[0]?.id;
    if (!targetBookingId) {
      setErrorMsg('No concluded stay found. Only guests with completed check-outs may review.');
      return;
    }

    if (!title.trim() || !comment.trim()) {
      setErrorMsg('Please provide a title and detailed comment regarding your stay.');
      return;
    }

    try {
      actions.addReview({
        hotelId,
        bookingId: targetBookingId,
        rating,
        subRatings,
        title,
        comment,
      });

      setSuccessMsg('Your verified stay review has been published. Thank you for sharing your experience!');
      setTitle('');
      setComment('');
      setShowReviewForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review.');
    }
  };

  // Handle Management Reply
  const handleManagementReply = (reviewId: string) => {
    if (!managementComment.trim()) return;
    actions.addManagementResponse(reviewId, managementComment);
    setReplyingReviewId(null);
    setManagementComment('');
  };

  // Helper: Fast checkout simulator for instant evaluation in demo
  const handleSimulateFastCheckout = () => {
    // Look for any active booking of the current user or create a concluded booking
    const activeBooking = bookings.find(
      (b) => b.guestId === currentUser.id && b.hotelId === hotelId && b.bookingStatus === 'checked_in'
    );

    if (activeBooking) {
      actions.checkOutGuest(activeBooking.id);
      setSelectedBookingId(activeBooking.id);
      setShowReviewForm(true);
    } else {
      // Create instant concluded stay record
      const hold = actions.createBookingHold({
        hotelId,
        roomId: 'room_101',
        checkIn: '2026-10-18',
        checkOut: '2026-10-21',
        numberOfAdults: 2,
        numberOfChildren: 0,
        guestDetails: {
          name: currentUser.name,
          email: currentUser.email,
          phone: currentUser.phone || '+91 98765 00000',
        },
      });
      actions.confirmPayment(hold.id, 'card');
      actions.checkInGuest(hold.id);
      actions.checkOutGuest(hold.id);
      setSelectedBookingId(hold.id);
      setShowReviewForm(true);
    }
  };

  const isManagementUser = ['manager', 'admin'].includes(currentUser.role);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-slate-200">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Verified Guest Experiences</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-[#0F2C59]">
            Guest Evaluations & Royal Reviews
          </h2>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Authentic appraisals from verified patrons who have concluded their stay at {hotel.name}.
          </p>
        </div>

        {/* CTA to write review */}
        <div>
          {eligibleBookings.length > 0 ? (
            <button
              onClick={() => {
                setSelectedBookingId(eligibleBookings[0].id);
                setShowReviewForm(!showReviewForm);
              }}
              className="px-6 py-3 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-[#FAF8ED] font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <Star className="w-4 h-4 text-amber-300 fill-amber-300" />
              <span>{showReviewForm ? 'Cancel Review' : 'Rate Your Concluded Stay'}</span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row items-end gap-2">
              <span className="text-[11px] text-slate-500 font-medium">
                Verified stays only
              </span>
              <button
                onClick={handleSimulateFastCheckout}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                title="Simulates a concluded checkout for the current guest persona to test posting reviews immediately"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Simulate Concluded Stay & Review</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Review Submission Form (Expandable) */}
      {showReviewForm && (
        <div className="mb-12 bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-300 shadow-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-700 block">
                Verified Concluded Stay
              </span>
              <h3 className="text-xl font-serif font-bold text-[#0F2C59]">
                Share Your Palatial Evaluation
              </h3>
            </div>
            <button
              onClick={() => setShowReviewForm(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-6">
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Select Which Concluded Stay to Review */}
            {eligibleBookings.length > 1 && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Select Completed Itinerary
                </label>
                <select
                  value={selectedBookingId}
                  onChange={(e) => setSelectedBookingId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800"
                >
                  {eligibleBookings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.roomDetailsSnapshot?.categoryName} (Room {b.roomDetailsSnapshot?.roomNumber}) • Checked out: {b.checkOut}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Overall Star Rating */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Overall Sanctuary Experience *
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const isFilled = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      type="button"
                      key={starVal}
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          isFilled
                            ? 'text-amber-400 fill-amber-400 drop-shadow-xs'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  );
                })}

                <span className="ml-3 text-xs font-bold text-slate-700 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs">
                  {ratingLabels[hoverRating || rating]}
                </span>
              </div>
            </div>

            {/* Sub-Category Ratings */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Detailed Hospitality Metrics
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { key: 'cleanliness', label: 'Cleanliness & Sanitation' },
                  { key: 'hospitality', label: 'Butler Care & Hospitality' },
                  { key: 'comfort', label: 'Bed Comfort & Tranquility' },
                  { key: 'dining', label: 'Fine Dining & Culinary' },
                ].map(({ key, label }) => (
                  <div key={key} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                    <span className="font-semibold text-slate-700 block mb-1.5">{label}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          type="button"
                          key={val}
                          onClick={() =>
                            setSubRatings((prev) => ({ ...prev, [key]: val }))
                          }
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition ${
                            subRatings[key as keyof ReviewSubRatings] >= val
                              ? 'bg-amber-400 text-slate-950 font-bold'
                              : 'bg-white border border-slate-300 text-slate-400'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Review Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Headline / Title of Your Review *
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Unrivaled royal hospitality on Lake Pichola"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
            </div>

            {/* Review Detailed Comments */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Your Review & Observations *
              </label>
              <textarea
                rows={4}
                required
                maxLength={2000}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your chamber, the views, the quality of dining, interactions with royal staff, and recommendations for future patrons..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0F2C59]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Verified stay badge will be affixed to your post.</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 font-semibold text-xs hover:bg-slate-100"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0F2C59] hover:bg-[#081a36] text-[#FAF8ED] font-bold text-xs shadow-md transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Publish Review</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Aggregate Score & Category Breakdown Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Main Average Rating */}
          <div className="lg:col-span-4 text-center lg:text-left lg:border-r border-slate-200 lg:pr-8">
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block mb-1">
              Overall Sanctuary Rating
            </span>
            <div className="flex items-center justify-center lg:justify-start gap-3">
              <span className="text-5xl sm:text-6xl font-serif font-bold text-[#0F2C59]">
                {stats.avgRating}
              </span>
              <div>
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(stats.avgRating)
                          ? 'fill-amber-400'
                          : 'fill-slate-200 text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-500 font-semibold mt-0.5 block">
                  Based on {hotelReviews.length} verified stays
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              100% of reviews are posted by authenticated guests who completed a verified checkout.
            </p>
          </div>

          {/* Sub-Category Averages */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Cleanliness</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-sm text-[#0F2C59]">{stats.subAvgs.cleanliness} / 5.0</span>
                <span className="text-[10px] text-emerald-700 font-bold">Impeccable</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full"
                  style={{ width: `${(stats.subAvgs.cleanliness / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Hospitality & Staff</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-sm text-[#0F2C59]">{stats.subAvgs.hospitality} / 5.0</span>
                <span className="text-[10px] text-emerald-700 font-bold">Royal Butler</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(stats.subAvgs.hospitality / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Bed Comfort</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-sm text-[#0F2C59]">{stats.subAvgs.comfort} / 5.0</span>
                <span className="text-[10px] text-emerald-700 font-bold">Exceptional</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{ width: `${(stats.subAvgs.comfort / 5) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[11px] text-slate-500 font-medium block">Dining & Drinks</span>
              <div className="flex items-center justify-between mt-1">
                <span className="font-bold text-sm text-[#0F2C59]">{stats.subAvgs.dining} / 5.0</span>
                <span className="text-[10px] text-emerald-700 font-bold">Gourmet</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-purple-600 h-full rounded-full"
                  style={{ width: `${(stats.subAvgs.dining / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Star Distribution Histogram */}
          <div className="lg:col-span-3 space-y-1.5 text-xs text-slate-600">
            {[5, 4, 3, 2, 1].map((star) => (
              <div key={star} className="flex items-center gap-2">
                <span className="w-8 font-bold">{star} ★</span>
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all"
                    style={{ width: `${stats.distribution[star as 1 | 2 | 3 | 4 | 5]}%` }}
                  />
                </div>
                <span className="w-8 text-right text-[11px] text-slate-400 font-mono">
                  {stats.distribution[star as 1 | 2 | 3 | 4 | 5]}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter and Sorting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[11px] mr-1">
            Filter:
          </span>
          <button
            onClick={() => setFilterRating('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition ${
              filterRating === 'all'
                ? 'bg-[#0F2C59] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            All Reviews ({hotelReviews.length})
          </button>
          {[5, 4, 3].map((star) => (
            <button
              key={star}
              onClick={() => setFilterRating(star)}
              className={`px-3 py-1.5 rounded-lg font-bold transition ${
                filterRating === star
                  ? 'bg-[#0F2C59] text-white'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {star} Stars
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Sort By:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="p-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
          >
            <option value="recent">Most Recent Stays</option>
            <option value="highest">Highest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-6">
        {displayedReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 text-slate-500 text-xs">
            No reviews match the selected star filter.
          </div>
        ) : (
          displayedReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-4 hover:border-slate-300 transition"
            >
              {/* Review Author & Stay Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      rev.guestAvatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(rev.guestName)}&backgroundColor=0F2C59,C5A880`
                    }
                    alt={rev.guestName}
                    className="w-11 h-11 rounded-full object-cover border border-amber-300"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm">{rev.guestName}</h4>
                      {rev.isVerifiedStay && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified Stay</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Stayed in {rev.roomCategoryName || 'Palace Chamber'} • {rev.stayDate}
                    </p>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(rev.rating)
                            ? 'fill-amber-400'
                            : 'fill-slate-200 text-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="font-bold text-slate-800 text-xs font-mono">{rev.rating}.0</span>
                </div>
              </div>

              {/* Review Content */}
              <div>
                <h5 className="font-serif font-bold text-base text-[#0F2C59] mb-1">
                  "{rev.title}"
                </h5>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {rev.comment}
                </p>
              </div>

              {/* Sub-Ratings Chips */}
              {rev.subRatings && (
                <div className="flex flex-wrap gap-2 pt-1 text-[11px] text-slate-500">
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Cleanliness: <strong className="text-slate-800">{rev.subRatings.cleanliness}/5</strong>
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Hospitality: <strong className="text-slate-800">{rev.subRatings.hospitality}/5</strong>
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Comfort: <strong className="text-slate-800">{rev.subRatings.comfort}/5</strong>
                  </span>
                  <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                    Dining: <strong className="text-slate-800">{rev.subRatings.dining}/5</strong>
                  </span>
                </div>
              )}

              {/* Management Response Card */}
              {rev.managementResponse && (
                <div className="mt-4 p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-amber-700" />
                      <span>{rev.managementResponse.authorName}</span>
                    </span>
                    <span className="text-[10px] text-amber-800/70">
                      {new Date(rev.managementResponse.responseDate).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-slate-700 leading-relaxed italic">
                    "{rev.managementResponse.comment}"
                  </p>
                </div>
              )}

              {/* Footer Row: Likes count & Management Reply Trigger */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  onClick={() => actions.likeReview(rev.id)}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-amber-700 font-semibold transition"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Helpful ({rev.likesCount || 0})</span>
                </button>

                {isManagementUser && !rev.managementResponse && (
                  <button
                    onClick={() => setReplyingReviewId(rev.id)}
                    className="text-[#0F2C59] font-bold hover:underline flex items-center gap-1"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Post Official Management Reply</span>
                  </button>
                )}
              </div>

              {/* Management Reply Editor Modal / Box */}
              {replyingReviewId === rev.id && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-300 space-y-3 animate-in fade-in">
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Official Response from {currentUser.name} ({currentUser.role})
                  </label>
                  <textarea
                    rows={3}
                    value={managementComment}
                    onChange={(e) => setManagementComment(e.target.value)}
                    placeholder="Express gratitude to the guest, address their compliments or specific remarks with gracious palace hospitality..."
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReplyingReviewId(null)}
                      className="px-3 py-1.5 text-slate-600 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => handleManagementReply(rev.id)}
                      className="px-4 py-1.5 bg-[#0F2C59] text-white rounded-lg text-xs font-bold"
                    >
                      Publish Official Response
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </section>
  );
};
