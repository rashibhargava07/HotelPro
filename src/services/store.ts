import {
  User,
  Hotel,
  RoomCategory,
  Room,
  Booking,
  Payment,
  HousekeepingTask,
  ServiceRequest,
  AuditLogEntry,
  PriceBreakdown,
  HousekeepingStatus,
  OperationalStatus,
  ServiceRequestCategory,
  Review,
  ReviewSubRatings,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_HOTELS,
  INITIAL_ROOM_CATEGORIES,
  INITIAL_ROOMS,
  INITIAL_BOOKINGS,
  INITIAL_HOUSEKEEPING_TASKS,
  INITIAL_SERVICE_REQUESTS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REVIEWS,
} from './mockData';

const STORAGE_KEYS = {
  USERS: 'hotelpro_users_v1',
  CURRENT_USER: 'hotelpro_current_user_v1',
  HOTELS: 'hotelpro_hotels_v1',
  ROOM_CATEGORIES: 'hotelpro_categories_v1',
  ROOMS: 'hotelpro_rooms_v1',
  BOOKINGS: 'hotelpro_bookings_v1',
  PAYMENTS: 'hotelpro_payments_v1',
  HOUSEKEEPING: 'hotelpro_housekeeping_v1',
  SERVICE_REQUESTS: 'hotelpro_services_v1',
  AUDIT_LOGS: 'hotelpro_audit_logs_v1',
  ACTIVE_HOTEL_ID: 'hotelpro_active_hotel_id_v1',
  REVIEWS: 'hotelpro_reviews_v1',
};

// Safe load from LocalStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item);
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage`, e);
    return fallback;
  }
}

// Safe save
function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage`, e);
  }
}

// Simple event-driven subscriber pattern
type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function subscribeToStore(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

// Global In-Memory and Persistent State
class HotelProStore {
  users: User[] = loadFromStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  currentUser: User = loadFromStorage(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[3]); // Default to Guest (Vikram)
  hotels: Hotel[] = loadFromStorage(STORAGE_KEYS.HOTELS, INITIAL_HOTELS);
  categories: RoomCategory[] = loadFromStorage(STORAGE_KEYS.ROOM_CATEGORIES, INITIAL_ROOM_CATEGORIES);
  rooms: Room[] = loadFromStorage(STORAGE_KEYS.ROOMS, INITIAL_ROOMS);
  bookings: Booking[] = loadFromStorage(STORAGE_KEYS.BOOKINGS, INITIAL_BOOKINGS);
  payments: Payment[] = loadFromStorage(STORAGE_KEYS.PAYMENTS, []);
  housekeepingTasks: HousekeepingTask[] = loadFromStorage(STORAGE_KEYS.HOUSEKEEPING, INITIAL_HOUSEKEEPING_TASKS);
  serviceRequests: ServiceRequest[] = loadFromStorage(STORAGE_KEYS.SERVICE_REQUESTS, INITIAL_SERVICE_REQUESTS);
  auditLogs: AuditLogEntry[] = loadFromStorage(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  activeHotelId: string = loadFromStorage(STORAGE_KEYS.ACTIVE_HOTEL_ID, 'hotel_grand_heritage');
  reviews: Review[] = loadFromStorage(STORAGE_KEYS.REVIEWS, INITIAL_REVIEWS);

  private persist() {
    saveToStorage(STORAGE_KEYS.USERS, this.users);
    saveToStorage(STORAGE_KEYS.CURRENT_USER, this.currentUser);
    saveToStorage(STORAGE_KEYS.HOTELS, this.hotels);
    saveToStorage(STORAGE_KEYS.ROOM_CATEGORIES, this.categories);
    saveToStorage(STORAGE_KEYS.ROOMS, this.rooms);
    saveToStorage(STORAGE_KEYS.BOOKINGS, this.bookings);
    saveToStorage(STORAGE_KEYS.PAYMENTS, this.payments);
    saveToStorage(STORAGE_KEYS.HOUSEKEEPING, this.housekeepingTasks);
    saveToStorage(STORAGE_KEYS.SERVICE_REQUESTS, this.serviceRequests);
    saveToStorage(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    saveToStorage(STORAGE_KEYS.ACTIVE_HOTEL_ID, this.activeHotelId);
    saveToStorage(STORAGE_KEYS.REVIEWS, this.reviews);
    notify();
  }

  // Reset to initial clean seed state
  resetAll() {
    this.users = [...INITIAL_USERS];
    this.currentUser = INITIAL_USERS[3];
    this.hotels = [...INITIAL_HOTELS];
    this.categories = [...INITIAL_ROOM_CATEGORIES];
    this.rooms = [...INITIAL_ROOMS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.payments = [];
    this.housekeepingTasks = [...INITIAL_HOUSEKEEPING_TASKS];
    this.serviceRequests = [...INITIAL_SERVICE_REQUESTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.activeHotelId = 'hotel_grand_heritage';
    this.reviews = [...INITIAL_REVIEWS];
    this.persist();
  }


  // Switch Current User Persona
  setCurrentUser(user: User) {
    this.currentUser = user;
    this.persist();
  }

  // Switch Active Hotel Property for multi-property views
  setActiveHotelId(hotelId: string) {
    this.activeHotelId = hotelId;
    this.persist();
  }

  // Pricing Calculation Service: Weekend markups (Fri/Sat +15%), 12% GST, ₹250 flat fee
  calculateBookingQuote(baseRate: number, checkInDate: string, checkOutDate: string): PriceBreakdown {
    const checkIn = new Date(checkInDate + 'T00:00:00');
    const checkOut = new Date(checkOutDate + 'T00:00:00');

    const diffTime = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

    let subtotal = 0;
    let weekendSurcharge = 0;

    for (let i = 0; i < nights; i++) {
      const currentDay = new Date(checkIn);
      currentDay.setDate(currentDay.getDate() + i);
      const dayOfWeek = currentDay.getDay(); // 0 is Sunday, 5 is Friday, 6 is Saturday

      if (dayOfWeek === 5 || dayOfWeek === 6) {
        const surge = Math.round(baseRate * 0.15);
        weekendSurcharge += surge;
        subtotal += baseRate + surge;
      } else {
        subtotal += baseRate;
      }
    }

    const taxAmount = Math.round(subtotal * 0.12); // Standard 12% GST
    const fees = 250; // Nominal concierge service fee
    const totalAmount = subtotal + taxAmount + fees;

    return {
      nights,
      baseRatePerNight: baseRate,
      subtotal,
      weekendSurcharge,
      taxAmount,
      fees,
      totalAmount,
      currency: 'INR',
    };
  }

  // Room Availability Algorithm: Check overlap interval
  isRoomAvailable(roomId: string, checkInStr: string, checkOutStr: string, excludeBookingId?: string): boolean {
    const reqIn = new Date(checkInStr + 'T00:00:00').getTime();
    const reqOut = new Date(checkOutStr + 'T00:00:00').getTime();

    const now = Date.now();

    for (const b of this.bookings) {
      if (b.roomId !== roomId) continue;
      if (excludeBookingId && b.id === excludeBookingId) continue;
      if (b.bookingStatus === 'cancelled' || b.bookingStatus === 'checked_out') continue;

      // If pending payment, verify hold has not expired
      if (b.bookingStatus === 'pending_payment' && b.inventoryHoldExpiresAt) {
        const holdExp = new Date(b.inventoryHoldExpiresAt).getTime();
        if (holdExp < now) continue; // Hold expired, available
      }

      const bIn = new Date(b.checkIn + 'T00:00:00').getTime();
      const bOut = new Date(b.checkOut + 'T00:00:00').getTime();

      // Half-open interval overlap check
      if (bIn < reqOut && bOut > reqIn) {
        return false;
      }
    }

    return true;
  }

  // Find Available Rooms in a Hotel for given dates and category
  findAvailableRooms(hotelId: string, checkIn: string, checkOut: string, categoryId?: string): Room[] {
    return this.rooms.filter((room) => {
      if (room.hotelId !== hotelId) return false;
      if (!room.active || room.operationalStatus !== 'available') return false;
      if (categoryId && room.categoryId !== categoryId) return false;
      return this.isRoomAvailable(room.id, checkIn, checkOut);
    });
  }

  // Create 15-minute Hold Booking
  createBookingHold(params: {
    hotelId: string;
    roomId: string;
    checkIn: string;
    checkOut: string;
    numberOfAdults: number;
    numberOfChildren: number;
    guestDetails: {
      name: string;
      email: string;
      phone: string;
      specialRequests?: string;
    };
  }): Booking {
    const { hotelId, roomId, checkIn, checkOut, numberOfAdults, numberOfChildren, guestDetails } = params;

    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) throw new Error('Selected room not found.');

    const category = this.categories.find((c) => c.id === room.categoryId);
    const available = this.isRoomAvailable(roomId, checkIn, checkOut);

    if (!available) {
      throw new Error('This room is already reserved for the selected dates. Please choose another.');
    }

    const priceBreakdown = this.calculateBookingQuote(room.basePrice, checkIn, checkOut);
    const holdExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const bookingRef = 'HP-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const newBooking: Booking = {
      id: `bkg_${Date.now()}`,
      bookingReference: bookingRef,
      guestId: this.currentUser.id,
      hotelId,
      roomId,
      categoryId: room.categoryId,
      checkIn,
      checkOut,
      numberOfAdults,
      numberOfChildren,
      guestDetailsSnapshot: {
        name: guestDetails.name || this.currentUser.name,
        email: guestDetails.email || this.currentUser.email,
        phone: guestDetails.phone || this.currentUser.phone || '+91 98765 00000',
        specialRequests: guestDetails.specialRequests,
      },
      roomDetailsSnapshot: {
        roomNumber: room.roomNumber,
        categoryName: category?.name || 'Deluxe Room',
      },
      priceBreakdown,
      currency: 'INR',
      bookingStatus: 'pending_payment',
      paymentStatus: 'unpaid',
      inventoryHoldExpiresAt: holdExpiresAt,
      createdAt: new Date().toISOString(),
    };

    this.bookings.unshift(newBooking);
    this.addAuditLog('BOOKING_HOLD_CREATED', `Temporary 15-minute hold on Room ${room.roomNumber} (${bookingRef})`);
    this.persist();
    return newBooking;
  }

  // Confirm Payment (Razorpay sandbox simulation or real card confirmation)
  confirmPayment(bookingId: string, method: 'upi' | 'card' | 'netbanking' = 'card'): { booking: Booking; payment: Payment } {
    const bookingIndex = this.bookings.findIndex((b) => b.id === bookingId);
    if (bookingIndex === -1) throw new Error('Booking not found.');

    const booking = this.bookings[bookingIndex];
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const gatewayOrderId = `order_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    const payment: Payment = {
      id: paymentId,
      bookingId: booking.id,
      bookingReference: booking.bookingReference,
      guestId: booking.guestId,
      gateway: 'razorpay',
      gatewayOrderId,
      gatewayPaymentId: paymentId,
      amount: booking.priceBreakdown.totalAmount,
      currency: 'INR',
      status: 'captured',
      method,
      paidAt: new Date().toISOString(),
    };

    booking.bookingStatus = 'confirmed';
    booking.paymentStatus = 'paid';
    booking.inventoryHoldExpiresAt = undefined;

    this.bookings[bookingIndex] = booking;
    this.payments.unshift(payment);

    this.addAuditLog(
      'PAYMENT_CAPTURED',
      `Payment of ₹${payment.amount.toLocaleString()} captured for ${booking.bookingReference} via ${method.toUpperCase()}`
    );
    this.persist();

    return { booking, payment };
  }

  // Cancel Booking
  cancelBooking(bookingId: string, reason: string = 'Guest requested cancellation') {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) return;

    b.bookingStatus = 'cancelled';
    b.cancellationDetails = {
      reason,
      cancelledAt: new Date().toISOString(),
      refundAmount: b.paymentStatus === 'paid' ? b.priceBreakdown.totalAmount : 0,
    };
    if (b.paymentStatus === 'paid') {
      b.paymentStatus = 'refunded';
    }

    this.addAuditLog('BOOKING_CANCELLED', `Booking ${b.bookingReference} cancelled. Reason: ${reason}`);
    this.persist();
  }

  // Staff Check-In
  checkInGuest(bookingId: string) {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking not found.');
    if (b.bookingStatus !== 'confirmed') throw new Error('Only confirmed bookings can be checked in.');

    b.bookingStatus = 'checked_in';
    b.checkInRecord = {
      checkedInAt: new Date().toISOString(),
      staffId: this.currentUser.id,
      staffName: this.currentUser.name,
    };

    this.addAuditLog('GUEST_CHECKED_IN', `Guest checked in to Room ${b.roomDetailsSnapshot.roomNumber} (${b.bookingReference})`);
    this.persist();
  }

  // Staff Check-Out: Automatically updates Room status to 'dirty' & dispatches HousekeepingTask
  checkOutGuest(bookingId: string) {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking not found.');
    if (b.bookingStatus !== 'checked_in') throw new Error('Booking is not currently checked in.');

    b.bookingStatus = 'checked_out';
    b.checkOutRecord = {
      checkedOutAt: new Date().toISOString(),
      staffId: this.currentUser.id,
      staffName: this.currentUser.name,
    };

    // Transition room to dirty
    const room = this.rooms.find((r) => r.id === b.roomId);
    if (room) {
      room.housekeepingStatus = 'dirty';
    }

    // Auto-dispatch high priority checkout cleaning task
    const newTask: HousekeepingTask = {
      id: `hk_${Date.now()}`,
      hotelId: b.hotelId,
      roomId: b.roomId,
      roomNumber: b.roomDetailsSnapshot.roomNumber,
      taskType: 'checkout_cleaning',
      priority: 'high',
      status: 'pending',
      notes: `Automated post-checkout turnaround for booking ${b.bookingReference}. Change all linens & restock amenities.`,
      createdAt: new Date().toISOString(),
    };
    this.housekeepingTasks.unshift(newTask);

    this.addAuditLog(
      'GUEST_CHECKED_OUT',
      `Guest checked out from Room ${b.roomDetailsSnapshot.roomNumber}. Housekeeping turnaround task auto-dispatched.`
    );
    this.persist();
  }

  // Update Housekeeping Task Status
  updateHousekeepingTask(taskId: string, status: HousekeepingTask['status'], staffId?: string, staffName?: string, notes?: string) {
    const task = this.housekeepingTasks.find((t) => t.id === taskId);
    if (!task) return;

    task.status = status;
    if (staffId) {
      task.assignedStaffId = staffId;
      task.assignedStaffName = staffName;
    }
    if (status === 'completed') {
      task.completedAt = new Date().toISOString();
      // If completed checkout cleaning or deep clean, set room to 'inspected' or 'clean'
      const room = this.rooms.find((r) => r.id === task.roomId);
      if (room) {
        room.housekeepingStatus = task.taskType === 'inspection' ? 'inspected' : 'clean';
      }
    }
    if (notes) task.notes = notes;

    this.addAuditLog('HOUSEKEEPING_TASK_UPDATED', `Task for Room ${task.roomNumber} updated to status: ${status}`);
    this.persist();
  }

  // Update Room Housekeeping / Operational Status
  updateRoomStatus(roomId: string, housekeepingStatus?: HousekeepingStatus, operationalStatus?: OperationalStatus) {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) return;
    if (housekeepingStatus) room.housekeepingStatus = housekeepingStatus;
    if (operationalStatus) room.operationalStatus = operationalStatus;

    this.addAuditLog(
      'ROOM_STATUS_UPDATED',
      `Room ${room.roomNumber} set to HK: ${room.housekeepingStatus}, Ops: ${room.operationalStatus}`
    );
    this.persist();
  }

  // Update Room Base Price (Manager feature)
  updateRoomCategoryPrice(categoryId: string, newBasePrice: number) {
    const cat = this.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    cat.basePrice = newBasePrice;

    // Update all matching rooms
    this.rooms.forEach((r) => {
      if (r.categoryId === categoryId) {
        r.basePrice = newBasePrice;
      }
    });

    this.addAuditLog('PRICING_UPDATED', `Base price for category '${cat.name}' updated to ₹${newBasePrice.toLocaleString()}`);
    this.persist();
  }

  // Create Guest In-Stay Service Request
  createServiceRequest(params: {
    hotelId: string;
    roomId: string;
    roomNumber: string;
    bookingId: string;
    category: ServiceRequestCategory;
    description: string;
    priority?: 'low' | 'medium' | 'high';
  }) {
    const newReq: ServiceRequest = {
      id: `req_${Date.now()}`,
      hotelId: params.hotelId,
      roomId: params.roomId,
      roomNumber: params.roomNumber,
      bookingId: params.bookingId,
      guestId: this.currentUser.id,
      guestName: this.currentUser.name,
      category: params.category,
      description: params.description,
      priority: params.priority || 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    };

    this.serviceRequests.unshift(newReq);
    this.addAuditLog('SERVICE_REQUEST_CREATED', `New ${params.category} request for Room ${params.roomNumber}`);
    this.persist();
    return newReq;
  }

  // Update Service Request Status
  updateServiceRequestStatus(reqId: string, status: ServiceRequest['status'], staffId?: string, staffName?: string) {
    const req = this.serviceRequests.find((r) => r.id === reqId);
    if (!req) return;
    req.status = status;
    if (staffId) {
      req.assignedStaffId = staffId;
      req.assignedStaffName = staffName;
    }
    this.addAuditLog('SERVICE_REQUEST_UPDATED', `Request for Room ${req.roomNumber} updated to ${status}`);
    this.persist();
  }

  // Admin: Update User Role
  updateUserRole(userId: string, newRole: User['role']) {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return;
    user.role = newRole;
    if (this.currentUser.id === userId) {
      this.currentUser.role = newRole;
    }
    this.addAuditLog('USER_ROLE_CHANGED', `User ${user.email} role updated to ${newRole}`);
    this.persist();
  }

  // Admin: Register or Add New User
  registerUser(name: string, email: string, role: User['role'] = 'guest', phone: string = ''): User {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      this.currentUser = existing;
      this.persist();
      return existing;
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email: email.toLowerCase(),
      role,
      phone,
      accountStatus: 'active',
      assignedHotelIds: ['hotel_grand_heritage'],
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}&backgroundColor=0F2C59,C5A880`,
      lastLoginAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.addAuditLog('USER_REGISTERED', `New account created: ${name} (${email})`);
    this.persist();
    return newUser;
  }

  // Admin: Add or Update Hotel
  saveHotel(hotel: Hotel) {
    const idx = this.hotels.findIndex((h) => h.id === hotel.id);
    if (idx >= 0) {
      this.hotels[idx] = hotel;
      this.addAuditLog('HOTEL_UPDATED', `Hotel properties updated: ${hotel.name}`);
    } else {
      this.hotels.push(hotel);
      this.addAuditLog('HOTEL_CREATED', `New hotel registered: ${hotel.name}`);
    }
    this.persist();
  }

  // Reviews: Add review for concluded stay
  addReview(params: {
    hotelId: string;
    bookingId: string;
    rating: number;
    subRatings: ReviewSubRatings;
    title: string;
    comment: string;
  }): Review {
    const { hotelId, bookingId, rating, subRatings, title, comment } = params;

    // Verify booking exists and has concluded (checked_out)
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) {
      throw new Error('Associated reservation not found.');
    }

    if (booking.bookingStatus !== 'checked_out') {
      throw new Error('Reviews can only be submitted after your stay has concluded (checked out).');
    }

    // Check if review already exists for this booking
    const alreadyReviewed = this.reviews.some((r) => r.bookingId === bookingId);
    if (alreadyReviewed) {
      throw new Error('A review has already been submitted for this stay.');
    }

    const stayMonthYear = new Date(booking.checkOut).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    const newReview: Review = {
      id: `rev_${Date.now()}`,
      hotelId,
      bookingId,
      guestId: this.currentUser.id,
      guestName: this.currentUser.name,
      guestAvatar: this.currentUser.avatarUrl,
      roomCategoryName: booking.roomDetailsSnapshot?.categoryName || 'Deluxe Chamber',
      rating,
      subRatings,
      title: title.trim(),
      comment: comment.trim(),
      stayDate: stayMonthYear,
      isVerifiedStay: true,
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    this.reviews.unshift(newReview);
    this.recalculateHotelRating(hotelId);
    this.addAuditLog(
      'REVIEW_SUBMITTED',
      `New ${rating}-star verified review submitted for ${booking.roomDetailsSnapshot?.categoryName} by ${this.currentUser.name}`
    );
    this.persist();
    return newReview;
  }

  // Management reply to review
  addManagementResponse(reviewId: string, comment: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (!rev) return;

    rev.managementResponse = {
      authorName: `${this.currentUser.name} (${this.currentUser.role === 'admin' ? 'General Management' : 'Palace Manager'})`,
      responseDate: new Date().toISOString(),
      comment: comment.trim(),
    };

    this.addAuditLog('MANAGEMENT_RESPONSE_POSTED', `Management response posted for review "${rev.title}"`);
    this.persist();
  }

  // Like a review
  likeReview(reviewId: string) {
    const rev = this.reviews.find((r) => r.id === reviewId);
    if (!rev) return;
    rev.likesCount = (rev.likesCount || 0) + 1;
    this.persist();
  }

  // Get concluded bookings for the current guest eligible for review
  getEligibleConcludedBookingsForGuest(hotelId?: string): Booking[] {
    return this.bookings.filter((b) => {
      if (b.guestId !== this.currentUser.id) return false;
      if (b.bookingStatus !== 'checked_out') return false;
      if (hotelId && b.hotelId !== hotelId) return false;
      // Filter out bookings that already have reviews
      const alreadyReviewed = this.reviews.some((r) => r.bookingId === b.id);
      return !alreadyReviewed;
    });
  }

  // Recalculate average rating & review count for a hotel
  private recalculateHotelRating(hotelId: string) {
    const hotelReviews = this.reviews.filter((r) => r.hotelId === hotelId);
    const hotel = this.hotels.find((h) => h.id === hotelId);
    if (!hotel) return;

    if (hotelReviews.length === 0) {
      hotel.rating = 5.0;
      hotel.reviewCount = 0;
    } else {
      const sum = hotelReviews.reduce((acc, r) => acc + r.rating, 0);
      hotel.rating = Math.round((sum / hotelReviews.length) * 10) / 10;
      hotel.reviewCount = hotelReviews.length;
    }
  }

  private addAuditLog(action: string, details: string) {

    const log: AuditLogEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      performedBy: {
        userId: this.currentUser.id,
        name: this.currentUser.name,
        role: this.currentUser.role,
      },
      hotelId: this.activeHotelId,
    };
    this.auditLogs.unshift(log);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }
}

export const store = new HotelProStore();
