import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { CheckCircle2, Calendar, Ticket, Send } from 'lucide-react';

interface BookingSuccessState {
  bookingId: string;
  flightNumber: string;
}

const BookingSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as BookingSuccessState;
  
  useEffect(() => {

    if (!state?.bookingId) {
      navigate('/');
    }
  }, [state, navigate]);
  
  if (!state?.bookingId) {
    return null;
  }

  return (
    <div className="container max-w-md py-10">
      <Card className="text-center">
        <CardContent className="pt-6 space-y-6">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold">Booking Confirmed!</h1>
            <p className="text-muted-foreground mt-1">
              Thank you for booking with AirTicket.
            </p>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="bg-muted/40 rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Booking Reference</span>
                </div>
                <span className="font-medium">{state.bookingId}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Flight Number</span>
                </div>
                <span className="font-medium">{state.flightNumber}</span>
              </div>
            </div>
            
            <p className="text-sm">
              We've sent the booking details to your email address.
              You can also view your booking in the "My Bookings" section.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button asChild className="w-full">
            <Link to="/bookings">View My Bookings</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link to="/">Return to Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default BookingSuccessPage;