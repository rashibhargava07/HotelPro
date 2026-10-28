export type UserRole = 'guest' | 'staff' | 'manager' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  accountStatus: 'active' | 'suspended' | 'pending';
  assignedHotelIds: string[];
  lastLoginAt?: string;
  avatarUrl?: string;
}

export interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  contactDetails: {
    phone: string;
    email: string;
  };
  timeZone: string;
  checkInTime: string;
  checkOutTime: string;
  amenities: string[];
  images: string[];
  policies: {
    cancellation: string;
    petsAllowed: boolean;
  };
  publicationStatus: 'draft' | 'published' | 'suspended';
  managerIds: string[];
  rating: number;
  reviewCount: number;
}

export interface RoomCategory {
  id: string;
  hotelId: string;
  name: string;
  description: string;
  capacity: {
    adults: number;
    children: number;
  };
  bedConfiguration: string;
  amenities: string[];
  basePrice: number;
  images: string[];
  active: boolean;
}

export type HousekeepingStatus = 'clean' | 'dirty' | 'cleaning_in_progress' | 'inspected';
export type OperationalStatus = 'available' | 'out_of_service' | 'maintenance';

export interface Room {
  id: string;
  hotelId: string;
  roomNumber: string;
  categoryId: string;
  basePrice: number;
  currency: string;
  housekeepingStatus: HousekeepingStatus;
  operationalStatus: OperationalStatus;
  floor: number;
  active: boolean;
}

export type BookingStatus = 'pending_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded' | 'failed';

export interface PriceBreakdown {
  nights: number;
  baseRatePerNight: number;
  subtotal: number;
  weekendSurcharge: number;
  taxAmount: number;
  fees: number;
  totalAmount: number;
  currency: string;
}

export interface Booking {
  id: string;
  bookingReference: string;
  guestId: string;
  hotelId: string;
  roomId: string;
  categoryId: string;
  checkIn: string; // ISO date YYYY-MM-DD
  checkOut: string; // ISO date YYYY-MM-DD
  numberOfAdults: number;
  numberOfChildren: number;
  guestDetailsSnapshot: {
    name: string;
    email: string;
    phone: string;
    specialRequests?: string;
  };
  roomDetailsSnapshot: {
    roomNumber: string;
    categoryName: string;
  };
  priceBreakdown: PriceBreakdown;
  currency: string;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  inventoryHoldExpiresAt?: string; // ISO timestamp
  cancellationDetails?: {
    reason: string;
    cancelledAt: string;
    refundAmount: number;
  };
  checkInRecord?: {
    checkedInAt: string;
    staffId: string;
    staffName: string;
  };
  checkOutRecord?: {
    checkedOutAt: string;
    staffId: string;
    staffName: string;
  };
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  bookingReference: string;
  guestId: string;
  gateway: 'razorpay' | 'mock_sandbox';
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  amount: number;
  currency: string;
  status: 'created' | 'captured' | 'failed' | 'refunded';
  method?: 'upi' | 'card' | 'netbanking';
  paidAt?: string;
}

export type HousekeepingPriority = 'low' | 'medium' | 'high' | 'urgent';
export type HousekeepingTaskStatus = 'pending' | 'in_progress' | 'completed';

export interface HousekeepingTask {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  taskType: 'checkout_cleaning' | 'stayover_cleaning' | 'deep_clean' | 'inspection';
  priority: HousekeepingPriority;
  status: HousekeepingTaskStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

export type ServiceRequestCategory = 'room_service' | 'towels_bedding' | 'maintenance' | 'concierge';
export type ServiceRequestStatus = 'open' | 'assigned' | 'resolved' | 'closed';

export interface ServiceRequest {
  id: string;
  hotelId: string;
  roomId: string;
  roomNumber: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  category: ServiceRequestCategory;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: ServiceRequestStatus;
  assignedStaffId?: string;
  assignedStaffName?: string;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  details: string;
  performedBy: {
    userId: string;
    name: string;
    role: UserRole;
  };
  hotelId?: string;
}

export interface ReviewSubRatings {
  cleanliness: number;
  hospitality: number;
  comfort: number;
  dining: number;
}

export interface ManagementResponse {
  authorName: string;
  responseDate: string;
  comment: string;
}

export interface Review {
  id: string;
  hotelId: string;
  bookingId: string;
  guestId: string;
  guestName: string;
  guestAvatar?: string;
  roomCategoryName?: string;
  rating: number; // 1 to 5
  subRatings: ReviewSubRatings;
  title: string;
  comment: string;
  stayDate: string;
  isVerifiedStay: boolean;
  likesCount: number;
  managementResponse?: ManagementResponse;
  createdAt: string;
}

