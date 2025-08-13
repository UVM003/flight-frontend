import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarIcon, Loader2, Plane, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
//airport lists
const airports = [
  { code: "BLR", name: "Bengaluru: Kempegowda International Airport" },
  { code: "DEL", name: "Delhi: Indira Gandhi International Airport" },
  { code: "BOM", name: "Mumbai: Chhatrapati Shivaji Maharaj International Airport" },
  { code: "MAA", name: "Chennai: Chennai International Airport" },
  { code: "CCU", name: "Kolkata: Netaji Subhas Chandra Bose International Airport" },
  { code: "HYD", name: "Hyderabad: Rajiv Gandhi International Airport" },
  { code: "AMD", name: "Ahmedabad: Sardar Vallabhbhai Patel International Airport" },
  { code: "COK", name: "Kochi: Cochin International Airport" },
  { code: "GOI", name: "Goa: Dabolim Airport" },
  { code: "JAI", name: "Jaipur: Jaipur International Airport" },
  { code: "PNQ", name: "Pune: Pune International Airport" },
  { code: "LKO", name: "Lucknow: Chaudhary Charan Singh International Airport" },
  { code: "NAG", name: "Nagpur: Dr. Babasaheb Ambedkar International Airport" },
  { code: "VTZ", name: "Visakhapatnam: Visakhapatnam International Airport" },
  { code: "TIR", name: "Tirupati: Tirupati Airport" },
  { code: "VGA", name: "Vijayawada: Vijayawada Airport" },
  { code: "IXE", name: "Mangalore: Mangalore International Airport" },
  { code: "TRV", name: "Thiruvananthapuram: Trivandrum International Airport" },
  { code: "CCJ", name: "Calicut: Calicut International Airport" },
  { code: "CNN", name: "Kannur: Kannur International Airport" },
  { code: "CJB", name: "Coimbatore: Coimbatore International Airport" },
  { code: "TRZ", name: "Tiruchirappalli: Tiruchirappalli International Airport" },
  { code: "IXM", name: "Madurai: Madurai International Airport" },
  { code: "BBI", name: "Bhubaneswar: Biju Patnaik International Airport" },
]
// Mock data for demo purposes
const MOCK_FLIGHTS = [
  {
    flightId: 4,
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

  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [fareRange, setFareRange] = useState([0, 10000]);
  const [minSeats, setMinSeats] = useState('');

  const airlines = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Go First'];

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 5;

  const [filtersOpen, setFiltersOpen] = useState(false);

  const fetchFlights = async (page: number) => {
    if (!searchParams.fromAirport || !searchParams.toAirport) {
      alert("Please enter both From and To airports");
      return;
    }

    // *** Frontend validation for same airports ***
    if (searchParams.fromAirport === searchParams.toAirport) {
      alert("Departure and destination airports cannot be the same. Please select different airports.");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        fromAirport: searchParams.fromAirport,
        toAirport: searchParams.toAirport,
        departureDate: searchParams.departureDate,
        page: String(page),
        size: String(pageSize)
      });

      if (selectedAirlines.length > 0 && selectedAirlines.length < airlines.length) {
        selectedAirlines.forEach(airline => params.append("airlineName", airline));
      }
      if (fareRange[0] > 0) params.append("minFare", String(fareRange[0]));
      if (fareRange[1] < 10000) params.append("maxFare", String(fareRange[1]));
      if (minSeats) params.append("minSeats", String(minSeats));

      const response = await fetch(
        `http://localhost:8086/api/filter/flights/search/advanced?${params}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error fetching flights:", errorData);
        throw new Error(errorData.error || "No available flights");
      }
      const data = await response.json();
      console.log(data)
      setFlights(data);
      setCurrentPage(page);
    } catch (error: any) {
      console.error("Error fetching flights:", error);
      setFlights([]);
      alert(error.message || "Error fetching flights");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFiltersOpen(false);
    fetchFlights(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    if (!flightId) {
      alert("Flight ID is undefined!");
      return;
    }
    navigate(`/flights/${flightId}`);
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) =>
      prev.includes(airline)
        ? prev.filter((a) => a !== airline)
        : [...prev, airline]
    );
  };

  const toggleSelectAllAirlines = () => {
    if (selectedAirlines.length === airlines.length) {
      setSelectedAirlines([]);
    } else {
      setSelectedAirlines([...airlines]);
    }
  };

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
            {/* From Airport dropdown */}
            <div className="space-y-2">
              <Label htmlFor="fromAirport">From</Label>
              <select
                id="fromAirport"
                name="fromAirport"
                value={searchParams.fromAirport}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="" disabled>
                  Select Departure Airport
                </option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>

            {/* To Airport dropdown */}
            <div className="space-y-2">
              <Label htmlFor="toAirport">To</Label>
              <select
                id="toAirport"
                name="toAirport"
                value={searchParams.toAirport}
                onChange={handleInputChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="" disabled>
                  Select Destination Airport
                </option>
                {airports.map((airport) => (
                  <option key={airport.code} value={airport.code}>
                    {airport.name} ({airport.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label>Departure Date</Label>
              {/* ... same calendar popover as before ... */}
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
                    disabled={(date) => {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return date < today;
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search & Filters */}
            <div className="md:col-span-3 flex gap-2">
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

              {/* Filters Popover */}
              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" />
                    Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 space-y-4">
                  {/* Airline checkboxes */}
                  <div>
                    <Label>Airlines</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={selectedAirlines.length === airlines.length}
                          onCheckedChange={toggleSelectAllAirlines}
                        />
                        <span>Select All</span>
                      </div>
                      {airlines.map((airline) => (
                        <div key={airline} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedAirlines.includes(airline)}
                            onCheckedChange={() => toggleAirline(airline)}
                          />
                          <span>{airline}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Fare Range</Label>
                    <Slider
                      value={fareRange}
                      onValueChange={setFareRange}
                      max={10000}
                      step={500}
                    />
                    <div className="flex justify-between text-sm mt-1">
                      <span>₹{fareRange[0]}</span>
                      <span>₹{fareRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Minimum Seats</Label>
                    <input
                      type="number"
                      value={minSeats}
                      onChange={(e) => setMinSeats(e.target.value)}
                      className="w-full border rounded px-2 py-1"
                      min={0}
                    />
                  </div>

                  <Button className="w-full" onClick={handleSearch}>
                    Apply Filters
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          {isLoading
            ? "Loading..."
            : flights.length > 0
              ? `${flights.length} Flights Found`
              : "No Flights Found"}
        </h2>

        <AnimatePresence>
          {flights.map((flight) => (
            <motion.div
              key={flight.flightId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div className="space-y-1">
                      <div className="font-semibold text-lg">{flight.airlineName}</div>
                      <div className="text-muted-foreground text-sm">{flight.flightNumber}</div>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                      <div className="text-center">
                        <div className="text-xl font-semibold">
                          {format(new Date(flight.departureTime), "HH:mm")}
                        </div>
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
                        <div className="text-xl font-semibold">
                          {format(new Date(flight.arrivalTime), "HH:mm")}
                        </div>
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
                </CardContent>
                <CardFooter className="bg-muted/20 p-4 flex justify-end">
                  <Button onClick={() => handleViewFlight(flight.flightId)}>
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {flights.length > 0 && (
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              disabled={currentPage === 0}
              onClick={() => fetchFlights(currentPage - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={flights.length < pageSize}
              onClick={() => fetchFlights(currentPage + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;