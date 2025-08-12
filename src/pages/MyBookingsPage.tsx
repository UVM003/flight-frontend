import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Clock, ArrowRight, Search } from 'lucide-react';
import { format } from 'date-fns';

const MOCK_BOOKINGS = [
  {
    bookingId: "BK123456",
    customerId: 1,
    flightId: 1,
    flightNumber: "AI101",
    fromAirport: "DEL",
    toAirport: "BOM",
    departureTime: "2023-08-15T08:00:00",
    arrivalTime: "2023-08-15T10:00:00",
    bookingStatus: "CONFIRMED",
    bookingDate: "2023-08-01T12:30:45",
    totalPassengers: 2,
    totalFare: 7000,
    passengers: [
      { firstName: "John", lastName: "Doe", age: 35, gender: "Male", seatPreference: "Window" },
      { firstName: "Jane", lastName: "Doe", age: 32, gender: "Female", seatPreference: "Aisle" }
    ]
  },
  {
    bookingId: "BK789012",
    customerId: 1,
    flightId: 2,
    flightNumber: "UK203",
    fromAirport: "BOM",
    toAirport: "DEL",
    departureTime: "2023-08-20T16:30:00",
    arrivalTime: "2023-08-20T18:45:00",
    bookingStatus: "CONFIRMED",
    bookingDate: "2023-08-05T09:15:22",
    totalPassengers: 1,
    totalFare: 4200,
    passengers: [
      { firstName: "John", lastName: "Doe", age: 35, gender: "Male", seatPreference: "Window" }
    ]
  }
];

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState(MOCK_BOOKINGS);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    setTimeout(() => {
      setBookings(MOCK_BOOKINGS);
      setIsLoading(false);
    }, 1000);
  }, [navigate]);

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
  };

  const getStatusColor = (status) => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED': return 'default';
      case 'PENDING': return 'outline';
      case 'CANCELLED': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <Loader2 className="h-10 w-10 animate-spin mb-3 text-blue-600" />
        <p className="text-lg text-gray-700">Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-b from-blue-100 to-white">
      {/* Hero Section */}
      <div
        className="relative h-[220px] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')" }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl font-bold drop-shadow-lg">My Bookings</h1>
          <p className="mt-2 text-lg">View and manage all your flight reservations in one place</p>
        </div>
      </div>

      <div className="container py-10">
        {bookings.length === 0 ? (
          <Card className="shadow-lg">
            <CardContent className="flex flex-col items-center py-12">
              <Search className="h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Bookings Found</h2>
              <p className="text-center text-gray-500 mb-6 max-w-md">
                You don't have any flight bookings yet. Start by searching for flights and make your first booking.
              </p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link to="/search">Search Flights</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bookings List */}
            <div className={selectedBooking ? "lg:col-span-1" : "lg:col-span-3"}>
              <Card className="shadow-md">
                <CardHeader>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>You have {bookings.length} active bookings</CardDescription>
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
                        <TableRow
                          key={booking.bookingId}
                          className="hover:bg-blue-50 transition cursor-pointer"
                        >
                          <TableCell className="font-medium">{booking.bookingId}</TableCell>
                          <TableCell className="hidden sm:table-cell">{booking.flightNumber}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            {format(new Date(booking.departureTime), "MMM d, yyyy")}
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

            {/* Booking Details */}
            {selectedBooking && (
              <div className="lg:col-span-2">
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle>Booking Details</CardTitle>
                    <CardDescription>Booking ID: {selectedBooking.bookingId}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Flight Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Flight Information</h3>
                      <div className="bg-blue-50 p-4 rounded-md space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between">
                          <div>
                            <p className="font-medium text-lg">{format(new Date(selectedBooking.departureTime), "HH:mm")}</p>
                            <p className="text-sm text-gray-600">{selectedBooking.fromAirport}</p>
                            <p className="text-xs text-gray-500">{format(new Date(selectedBooking.departureTime), "MMM d, yyyy")}</p>
                          </div>
                          <div className="flex items-center my-2 sm:my-0">
                            <ArrowRight className="h-4 w-4 text-gray-500" />
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-lg">{format(new Date(selectedBooking.arrivalTime), "HH:mm")}</p>
                            <p className="text-sm text-gray-600">{selectedBooking.toAirport}</p>
                            <p className="text-xs text-gray-500">{format(new Date(selectedBooking.arrivalTime), "MMM d, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-2 border-t border-blue-200">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                            Flight: {selectedBooking.flightNumber}
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="h-4 w-4 mr-2 text-gray-500" />
                            Booked on: {format(new Date(selectedBooking.bookingDate), "MMM d, yyyy")}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Passengers */}
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
                          {selectedBooking.passengers.map((p, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{p.firstName} {p.lastName}</TableCell>
                              <TableCell>{p.age}</TableCell>
                              <TableCell>{p.gender}</TableCell>
                              <TableCell className="hidden sm:table-cell">{p.seatPreference || "N/A"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Payment */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Payment Information</h3>
                      <div className="bg-blue-50 p-4 rounded-md">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Total Passengers</span>
                          <span>{selectedBooking.totalPassengers}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Base Fare</span>
                          <span>₹{Math.round(selectedBooking.totalFare * 0.85)}</span>
                        </div>
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Taxes & Fees</span>
                          <span>₹{Math.round(selectedBooking.totalFare * 0.15)}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-blue-200 font-medium">
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
                      <Button className="bg-blue-600 hover:bg-blue-700">Download E-Ticket</Button>
                    </div>
                  </CardFooter>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookingsPage;
