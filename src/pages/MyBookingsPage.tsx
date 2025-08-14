import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';

interface TicketDetails {
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

const MyBookingsPage = () => {
  const navigate = useNavigate();

  // Declare state for bookings and selected booking
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState<TicketDetails[]>([]);
  const [selectedBooking, setSelectedBooking] = useState(null); 

  const customerData = JSON.parse(localStorage.getItem("customer") || "{}");
const tokenFromCustomer = customerData.token;
console.log(tokenFromCustomer);
const token = tokenFromCustomer;
useEffect(() => {
  fetch("http://localhost:8086/api/tickets/customer/myTickets", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
     .then((res) => res.json()) // Convert Response → JSON
  .then((data) => {
    setIsLoading(false);
    console.log("Fetched data:", data);
    // Make sure it's an array before mapping
    if (Array.isArray(data)) {
      console.log("Array")
      setBookings(data);
      console.log("bookings mapped",bookings);
    } else {
      console.error("Expected array but got:", data);
    }
  })}, [navigate,tokenFromCustomer]);

useEffect(() => {
  console.log("Updated bookings:", bookings);
}, [bookings]);
  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const getStatusColor = (status: string) => {
  switch (status.toUpperCase()) {
    case 'CONFIRMED':
      return 'default';  // changed from 'success' to 'default'
    case 'PENDING':
      return 'outline';  // changed from 'warning' to 'outline' (or 'secondary')
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
};

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
      <p className="text-muted-foreground mb-6">View and manage your flight bookings</p>

      {bookings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You don't have any flight bookings yet. Start by searching for flights and make your first booking.
            </p>
            <Button asChild>
              <Link to="/search">Search Flights</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-${selectedBooking ? 1 : 3}`}>
            <Card>
              <CardHeader>
                <CardTitle>Your Bookings</CardTitle>
                <CardDescription>You have {bookings.length} bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Booking ID</TableHead>
                      <TableHead className="hidden sm:table-cell">Flight</TableHead>
                      <TableHead className="hidden md:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
  {bookings.map((booking) => (
    <TableRow key={booking.ticketId}>
      <TableCell className="font-medium">{booking.bookingId}</TableCell>
      <TableCell className="hidden sm:table-cell">{booking.flightId}</TableCell>
      <TableCell className="hidden md:table-cell">
        {format(new Date(booking.journeyDate + "T00:00:00"), "MMM d, yyyy")}
      </TableCell>
      <TableCell>
        <Badge variant={getStatusColor(booking.bookingStatus)}>
          {booking.bookingStatus}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => handleViewDetails(booking)}
          className="hover:text-blue-600"
        >
          View
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>

                </Table>
              </CardContent>
            </Card>
          </div>

          {selectedBooking && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>Booking ID: {selectedBooking.bookingId}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Flight details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Flight Information</h3>
                    <div className="bg-muted/30 p-4 rounded-md space-y-4">
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div>
                          <p className="font-medium text-lg">{format(new Date(selectedBooking.departureTime), "HH:mm")}</p>
                          <p className="text-sm text-muted-foreground">{selectedBooking.fromAirport}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(selectedBooking.departureTime), "MMM d, yyyy")}</p>
                        </div>
                        <div className="flex items-center my-2 sm:my-0">
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-lg">{format(new Date(selectedBooking.arrivalTime), "HH:mm")}</p>
                          <p className="text-sm text-muted-foreground">{selectedBooking.toAirport}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(selectedBooking.arrivalTime), "MMM d, yyyy")}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-4 pt-2 border-t">
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                          Flight: {selectedBooking.flightNumber}
                        </div>
                        <div className="flex items-center text-sm">
                          <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                          Booked on: {format(new Date(selectedBooking.bookingDate), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Passenger details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Passenger Information</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead className="hidden sm:table-cell">Seat Preference</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedBooking.passengers.map((passenger, index) => (
                          <TableRow key={index}>
                            <TableCell>{passenger.fullName}</TableCell>
                            <TableCell>{passenger.age}</TableCell>
                            <TableCell>{passenger.gender}</TableCell>
                            <TableCell className="hidden sm:table-cell">{passenger.seatPreference || "N/A"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Payment details */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Payment Information</h3>
                    <div className="bg-muted/30 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Total Passengers</span>
                        <span>{selectedBooking.totalPassengers}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Base Fare</span>
                        <span>₹{Math.round(selectedBooking.totalFare * 0.85)}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-muted-foreground">Taxes & Fees</span>
                        <span>₹{Math.round(selectedBooking.totalFare * 0.15)}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t mt-2 font-medium">
                        <span>Total Amount</span>
                        <span>₹{selectedBooking.totalFare}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                    Back to All Bookings
                  </Button>
                  <div className="space-x-2">
                    {selectedBooking.bookingStatus === "CONFIRMED" && (
                      <Button 
                        variant="destructive" 
                        onClick={() => navigate(`/ticket-cancel/${selectedBooking.bookingId}`, {
                          state: {
                            fromAirport: selectedBooking.fromAirport,
                            toAirport: selectedBooking.toAirport,
                            bookingDate: selectedBooking.bookingDate,
                          },
                        })}
                      >
                        Cancel Booking
                      </Button>

                    )}
                    <Button>Download E-Ticket</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
