// src/types.ts

// Passenger info for booking form
export interface PassengerInfo {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  seatPreference?: string;
  mealPreference?: string;
}

// Customer registration request
export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

// Flight info object
export interface Flight {
  flightId: number;
  flightNumber: string;
  airlineName: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string; // ISO string date-time
  arrivalTime: string;   // ISO string date-time
  totalSeats: number;
  availableSeats: number;
  baseFare: number;
}

// Booking info
export interface Booking {
  bookingId: number;
  flightId: number;
  customerId: number;
  passengers: PassengerInfo[];
  totalFare: number;
  bookingDate: string; // ISO date string
  status: 'confirmed' | 'cancelled' | 'pending';
}

// User profile
export interface UserProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export interface Ticket {
  bookingId: string;
  customerId: number;
  flightId: number;
  flightNumber: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string;  // ISO string date
  arrivalTime: string;    // ISO string date
  bookingStatus: string;
  bookingDate: string;    // ISO string date
  totalPassengers: number;
  totalFare: number;
  passengers: PassengerInfo[];
}
export interface Customer {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  role: string;
  active: boolean;
  verified: boolean;
}

