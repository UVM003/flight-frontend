import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaneTakeoff, CalendarDays, MapPin, Ticket } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen">
      {/* Hero Section */}
      <div
        className="relative h-[300px] bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1502920514313-52581002a659')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-center items-center text-white text-center px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-lg">
            Welcome to Sky Connect
          </h1>
          <p className="mt-3 text-lg md:text-xl max-w-2xl">
            Find the best deals, book flights instantly, and manage your trips effortlessly.
          </p>
        </div>
      </div>

      {/* Main Content with suitcase background */}
      <div
        className="bg-cover bg-center"
        style={{
          backgroundImage: "url('/images/suitcase-bg.jpg')", // put your suitcase image in public/images
        }}
      >
        <div className="bg-white/70">
          {/* Features Section */}
          <div className="max-w-5xl mx-auto px-4 py-12 grid md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
              <MapPin className="mx-auto text-blue-600 mb-4" size={36} />
              <h3 className="text-lg font-semibold">Global Destinations</h3>
              <p className="mt-2 text-gray-600">Search flights to cities all over the world.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
              <CalendarDays className="mx-auto text-blue-600 mb-4" size={36} />
              <h3 className="text-lg font-semibold">Flexible Dates</h3>
              <p className="mt-2 text-gray-600">Choose your travel dates with ease.</p>
            </div>
            <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition">
              <Ticket className="mx-auto text-blue-600 mb-4" size={36} />
              <h3 className="text-lg font-semibold">Easy Booking</h3>
              <p className="mt-2 text-gray-600">Secure your seat in just a few clicks.</p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="max-w-3xl mx-auto px-4 pb-12">
            <Card className="shadow-xl">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Ready to Fly?</CardTitle>
                <CardDescription className="mt-2 text-gray-500">
                  Start your journey now with the easiest flight booking experience.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="mb-4">
                  Book your flights quickly and manage all your trips in one place.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate('/search')}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-all transform hover:scale-105"
                >
                  <PlaneTakeoff />
                  Search Flights
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
