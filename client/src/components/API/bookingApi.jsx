// src/api/bookingApi.js
export const getBookings = async () => {
  const res = await fetch('/api/bookings');
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return await res.json();
};