import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaneTakeoff } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="container py-12 max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Welcome to FlightBooker</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            Book your flights quickly and easily. Find the best deals and manage your bookings in one place.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <p className="mb-4">
            Search flights by origin, destination, and date. View flight details, book tickets, and check your bookings.
          </p>
          <p>
            Manage your profile and keep track of all your flight bookings in one convenient dashboard.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center mt-6">
          <Button 
            size="lg" 
            onClick={() => navigate('/search')} 
            className="flex items-center gap-2"
          >
            <PlaneTakeoff />
            Search Flights
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default HomePage;
