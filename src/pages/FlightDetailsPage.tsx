import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Plane, Clock, Calendar, Users, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
//import { AuthService } from '@/lib/api';

// Mock data for demonstration
const MOCK_FLIGHT = {
  flightId: 1,
  flightNumber: "AI101",
  airlineName: "Air India",
  fromAirport: "DEL",
  toAirport: "BOM",
  departureTime: "2023-08-10T08:00:00",
  arrivalTime: "2023-08-10T10:00:00",
  totalSeats: 180,
  availableSeats: 45,
  baseFare: 3500,
  createdAt: "2023-07-01T00:00:00",
  updatedAt: "2023-07-01T00:00:00"
};

const FlightDetailsPage = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState(MOCK_FLIGHT);
  const isAuthenticated = true;
  //const isAuthenticated = AuthService.isAuthenticated();

  useEffect(() => {
    // In a real app, fetch flight details from API
    setIsLoading(true);
    setTimeout(() => {
      setFlight(MOCK_FLIGHT);
      setIsLoading(false);
    }, 1000);
  }, [flightId]);

  // const handleBookNow = () => {
  //   if (!isAuthenticated) {
  //     navigate('/login', { state: { redirectTo: `/flights/${flightId}` } });
  //   } else {
  //     navigate(`/booking/${flightId}`);
  //   }
  // };
  const handleBookNow = () => {
  navigate(`/booking/${flightId}`);
};


  // Calculate flight duration
  const calculateDuration = () => {
    const dep = new Date(flight.departureTime);
    const arr = new Date(flight.arrivalTime);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading flight details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        ← Back to Search Results
      </Button>
      
      <h1 className="text-3xl font-bold mb-6">Flight Details</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="flex flex-col space-y-6">
            {/* Flight header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <h2 className="text-2xl font-semibold">{flight.airlineName}</h2>
                <p className="text-muted-foreground">{flight.flightNumber}</p>
              </div>
              <div className="text-2xl font-bold">₹{flight.baseFare}</div>
            </div>
            
            <Separator />
            
            {/* Flight journey */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Departure</p>
                <p className="text-2xl font-semibold">
                  {format(new Date(flight.departureTime), "HH:mm")}
                </p>
                <p className="font-medium">{flight.fromAirport}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(flight.departureTime), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
              
              <div className="flex flex-col items-center justify-center">
                <p className="text-muted-foreground mb-2">{calculateDuration()}</p>
                <div className="relative w-full">
                  <Separator className="my-2" />
                  <Plane className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2" />
                </div>
                <p className="text-muted-foreground mt-2">Direct Flight</p>
              </div>
              
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">Arrival</p>
                <p className="text-2xl font-semibold">
                  {format(new Date(flight.arrivalTime), "HH:mm")}
                </p>
                <p className="font-medium">{flight.toAirport}</p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(flight.arrivalTime), "EEEE, MMMM d, yyyy")}
                </p>
              </div>
            </div>
            
            <Separator />
            
            {/* Flight details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">
                    {format(new Date(flight.departureTime), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">{calculateDuration()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Available Seats</p>
                  <p className="font-medium">{flight.availableSeats} / {flight.totalSeats}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Plane className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Flight Number</p>
                  <p className="font-medium">{flight.flightNumber}</p>
                </div>
              </div>
            </div>
            
            {flight.availableSeats === 0 && (
              <div className="bg-destructive/10 p-4 rounded-md flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                <div>
                  <p className="font-medium text-destructive">Fully Booked</p>
                  <p className="text-sm text-muted-foreground">
                    There are no available seats for this flight.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="bg-muted/20 flex justify-between">
          <div className="text-xl font-bold">
            Price: ₹{flight.baseFare}
          </div>
          <Button 
            size="lg" 
            onClick={handleBookNow}
            disabled={flight.availableSeats === 0}
          >
            Book Now
          </Button>
        </CardFooter>
      </Card>
      
      {/* Fare details */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Fare Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Base Fare</span>
              <span>₹{flight.baseFare}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes & Fees</span>
              <span>₹{Math.round(flight.baseFare * 0.18)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold">
              <span>Total</span>
              <span>₹{flight.baseFare + Math.round(flight.baseFare * 0.18)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Policies */}
      <Card>
        <CardContent className="pt-6">
          <h3 className="text-xl font-semibold mb-4">Policies</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-1">Cancellation Policy</h4>
              <p className="text-sm text-muted-foreground">
                Cancellation fee starts from ₹{Math.round(flight.baseFare * 0.1)} up to 24 hours before departure.
                Non-refundable within 4 hours of departure.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-1">Baggage Allowance</h4>
              <p className="text-sm text-muted-foreground">
                Check-in: 15 kg per passenger. Cabin: 7 kg per passenger.
                Excess baggage charges apply.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FlightDetailsPage;