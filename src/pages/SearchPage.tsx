import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Loader2, Plane, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Mock data for demo purposes
const MOCK_FLIGHTS = [
  {
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
  },
  {
    flightId: 2,
    flightNumber: "UK203",
    airlineName: "Vistara",
    fromAirport: "DEL",
    toAirport: "BOM",
    departureTime: "2023-08-10T12:30:00",
    arrivalTime: "2023-08-10T14:45:00",
    totalSeats: 150,
    availableSeats: 22,
    baseFare: 4200,
  },
  {
    flightId: 3,
    flightNumber: "SG812",
    airlineName: "SpiceJet",
    fromAirport: "DEL",
    toAirport: "BOM",
    departureTime: "2023-08-10T16:15:00",
    arrivalTime: "2023-08-10T18:30:00",
    totalSeats: 186,
    availableSeats: 76,
    baseFare: 2900,
  }
];

const SearchPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchParams, setSearchParams] = useState({
    fromAirport: '',
    toAirport: '',
    departureDate: format(new Date(), 'yyyy-MM-dd'),
  });

  // Advanced filters
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [fareRange, setFareRange] = useState([0, 10000]);
  const [minSeats, setMinSeats] = useState('');

  // Airlines list
  const airlines = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Go First'];

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  // Popover control
  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchFlights = async (page: number) => {
    if (!searchParams.fromAirport || !searchParams.toAirport) {
      alert("Please enter both From and To airports");
      return;
    }

    setIsLoading(true);
    
    // In a real implementation, this would be an API call
    setTimeout(() => {
      setIsLoading(false);
      // Using mock data for now
      setFlights(MOCK_FLIGHTS);
    }, 1000);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setDate(date);
      setSearchParams((prev) => ({
        ...prev,
        departureDate: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleViewFlight = (flightId: number) => {
    navigate(`/flights/${flightId}`);
  };

  // Format duration between departure and arrival
  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Flights</h1>
      
      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="fromAirport">From</Label>
              <Input
                id="fromAirport"
                name="fromAirport"
                placeholder="Departure City or Airport"
                value={searchParams.fromAirport}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toAirport">To</Label>
              <Input
                id="toAirport"
                name="toAirport"
                placeholder="Destination City or Airport"
                value={searchParams.toAirport}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="md:col-span-3">
              <Button 
                className="w-full md:w-auto" 
                onClick={handleSearch}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Plane className="mr-2 h-4 w-4" />
                    Search Flights
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {flights.length > 0 ? `${flights.length} Flights Found` : "No Flights Found"}
        </h2>
        
        {flights.map((flight) => (
          <Card key={flight.flightId} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="p-6">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">{flight.airlineName}</div>
                    <div className="text-muted-foreground text-sm">{flight.flightNumber}</div>
                  </div>
                  
                  <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                    <div className="text-center">
                      <div className="text-xl font-semibold">{format(new Date(flight.departureTime), "HH:mm")}</div>
                      <div className="text-muted-foreground">{flight.fromAirport}</div>
                    </div>
                    
                    <div className="flex flex-col items-center">
                      <div className="text-sm text-muted-foreground">
                        {calculateDuration(flight.departureTime, flight.arrivalTime)}
                      </div>
                      <div className="relative w-24 md:w-32">
                        <Separator className="my-2" />
                        <Plane className="h-4 w-4 absolute -right-2 top-0 -translate-y-1/2" />
                      </div>
                      <div className="text-sm text-muted-foreground">Direct</div>
                    </div>
                    
                    <div className="text-center">
                      <div className="text-xl font-semibold">{format(new Date(flight.arrivalTime), "HH:mm")}</div>
                      <div className="text-muted-foreground">{flight.toAirport}</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-2xl font-bold">₹{flight.baseFare}</div>
                    <Badge variant={flight.availableSeats > 30 ? "outline" : "secondary"}>
                      {flight.availableSeats} seats left
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/20 p-4 flex justify-end">
              <Button onClick={() => handleViewFlight(flight.flightId)}>
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default SearchPage;
