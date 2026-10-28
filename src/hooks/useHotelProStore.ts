import { useState, useEffect } from 'react';
import { store, subscribeToStore } from '../services/store';

export function useHotelProStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setTick((prev) => prev + 1);
    });
    return unsubscribe;
  }, []);

  const activeHotel = store.hotels.find((h) => h.id === store.activeHotelId) || store.hotels[0];

  return {
    currentUser: store.currentUser,
    users: store.users,
    hotels: store.hotels,
    activeHotel,
    categories: store.categories,
    rooms: store.rooms,
    bookings: store.bookings,
    payments: store.payments,
    housekeepingTasks: store.housekeepingTasks,
    serviceRequests: store.serviceRequests,
    auditLogs: store.auditLogs,
    reviews: store.reviews,
    actions: {
      setCurrentUser: (u: typeof store.currentUser) => store.setCurrentUser(u),
      setActiveHotelId: (id: string) => store.setActiveHotelId(id),
      resetAll: () => store.resetAll(),
      calculateBookingQuote: (base: number, checkIn: string, checkOut: string) =>
        store.calculateBookingQuote(base, checkIn, checkOut),
      isRoomAvailable: (roomId: string, checkIn: string, checkOut: string, excludeId?: string) =>
        store.isRoomAvailable(roomId, checkIn, checkOut, excludeId),
      findAvailableRooms: (hotelId: string, checkIn: string, checkOut: string, categoryId?: string) =>
        store.findAvailableRooms(hotelId, checkIn, checkOut, categoryId),
      createBookingHold: (params: Parameters<typeof store.createBookingHold>[0]) =>
        store.createBookingHold(params),
      confirmPayment: (bookingId: string, method?: 'upi' | 'card' | 'netbanking') =>
        store.confirmPayment(bookingId, method),
      cancelBooking: (bookingId: string, reason?: string) => store.cancelBooking(bookingId, reason),
      checkInGuest: (bookingId: string) => store.checkInGuest(bookingId),
      checkOutGuest: (bookingId: string) => store.checkOutGuest(bookingId),
      updateHousekeepingTask: (taskId: string, status: any, staffId?: string, staffName?: string, notes?: string) =>
        store.updateHousekeepingTask(taskId, status, staffId, staffName, notes),
      updateRoomStatus: (roomId: string, hkStatus?: any, opsStatus?: any) =>
        store.updateRoomStatus(roomId, hkStatus, opsStatus),
      updateRoomCategoryPrice: (catId: string, newPrice: number) =>
        store.updateRoomCategoryPrice(catId, newPrice),
      createServiceRequest: (params: Parameters<typeof store.createServiceRequest>[0]) =>
        store.createServiceRequest(params),
      updateServiceRequestStatus: (reqId: string, status: any, staffId?: string, staffName?: string) =>
        store.updateServiceRequestStatus(reqId, status, staffId, staffName),
      updateUserRole: (userId: string, role: any) => store.updateUserRole(userId, role),
      registerUser: (name: string, email: string, role?: any, phone?: string) =>
        store.registerUser(name, email, role, phone),
      saveHotel: (hotel: any) => store.saveHotel(hotel),
      addReview: (params: Parameters<typeof store.addReview>[0]) => store.addReview(params),
      addManagementResponse: (reviewId: string, comment: string) =>
        store.addManagementResponse(reviewId, comment),
      likeReview: (reviewId: string) => store.likeReview(reviewId),
      getEligibleConcludedBookingsForGuest: (hotelId?: string) =>
        store.getEligibleConcludedBookingsForGuest(hotelId),
    },

  };
}
