export interface PassengerInfo {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  seatPreference?: string;
  mealPreference?: string;
}


export interface CustomerRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
}

export interface Flight {
  flightId: number;
  flightNumber: string;
  airlineName: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string; 
  arrivalTime: string;  
  totalSeats: number;
  availableSeats: number;
  baseFare: number;
}

export interface Booking {
  bookingId: number;
  flightId: number;
  customerId: number;
  passengers: PassengerInfo[];
  totalFare: number;
  bookingDate: string; 
  status: 'confirmed' | 'cancelled' | 'pending';
}

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
  departureTime: string;  
  arrivalTime: string;    
  bookingStatus: string;
  bookingDate: string;   
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

export interface TicketDetails {
  ticketId: number;
  bookingId: string;
  customerId: number;
  flightId: number;
  flightNumber: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string; 
  arrivalTime: string;  
  bookingStatus: string;
  journeyDate: string;
  bookingDate: string;   
  totalPassengers: number;
  totalFare: number;     
  passengers: PassengerInfoDTO[];
}

interface PassengerInfoDTO {
  fullName: string;
  age: number;
  gender: string;
  seatNumber: string;
}

export interface BookingTicketDetails {
  ticketId: number;
  bookingId: string;
  bookingDate: string;
  customerId: number;
  flightId: number;
  journeyDate: string;
  seatCount: number;
  status: string;
  totalFare: number;
}

export interface CancellationTicketDetails {
  bookingId: string;
  journeyDate: string;
  totalFare: number;
  cancellationCharge: number;
  refundAmount: number;
  refundStatus: string;
  message: string;
}

export interface BackendError {
  timestamp: string;
  message: string;
  details: string;
  httpCodeMessage: string;
  error?: string;
}