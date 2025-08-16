import { useState, useEffect } from 'react';
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

// Airport list
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
];

const airlines = ['IndiGo', 'Air India', 'Vistara', 'SpiceJet', 'Go First'];

const pageSize = 5;

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [flights, setFlights] = useState<any[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [searchParams, setSearchParams] = useState({
    fromAirport: "",
    toAirport: "",
    departureDate: format(new Date(), "yyyy-MM-dd"),
  });
  const [selectedAirlines, setSelectedAirlines] = useState<string[]>([]);
  const [fareRange, setFareRange] = useState<number[]>([0, 10000]);
  const [minSeats, setMinSeats] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // NEW: server-search mode flag
  const [isServerSearch, setIsServerSearch] = useState(false);

  // initial load - fetch all flights (client-side pagination)
  useEffect(() => {
    fetchAllFlights();
  }, []);

  const fetchAllFlights = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8086/api/flights");
      if (!response.ok) throw new Error("Failed to fetch flights");
      const data = await response.json();
      setFlights(data);
      setCurrentPage(0);
      setIsServerSearch(false); // ensure client-mode
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error fetching flights");
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a server-side page with filters applied
  const fetchFilteredFlights = async (page = 0) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        fromAirport: searchParams.fromAirport,
        toAirport: searchParams.toAirport,
        departureDate: searchParams.departureDate,
        page: String(page),
        size: String(pageSize),
      });

      // append airlines as multiple params if some are selected (and not all)
      if (selectedAirlines.length > 0 && selectedAirlines.length < airlines.length) {
        selectedAirlines.forEach((a) => params.append("airlineName", a));
      }

      if (fareRange[0] > 0) params.append("minFare", String(fareRange[0]));
      if (fareRange[1] < 10000) params.append("maxFare", String(fareRange[1]));
      if (minSeats) params.append("minSeats", String(minSeats));

      const url = `http://localhost:8086/api/filter/flights/search/advanced?${params.toString()}`;
      const response = await fetch(url);
      if (!response.ok) {
        // backend returns 4xx/5xx -> treat as no results for this page
        throw new Error("No flights found");
      }
      const data = await response.json();

      // backend returns the single page (size = pageSize)
      setFlights(data);
      setCurrentPage(page);
      setIsServerSearch(true);
      setFiltersOpen(false);
    } catch (error: any) {
      console.error(error);
      setFlights([]);
      alert(error.message || "Error fetching flights");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search button -> fetch page 0 from server (server-side pagination mode)
  const handleSearch = async () => {
    if (!searchParams.fromAirport || !searchParams.toAirport) {
      alert("Please select both From and To airports");
      return;
    }
    if (searchParams.fromAirport === searchParams.toAirport) {
      alert("Departure and destination cannot be the same");
      return;
    }
    // call server-side search page 0
    await fetchFilteredFlights(0);
  };

  // Pagination handlers:
  // - if server-mode: trigger API call for next/prev page
  // - else: client-side local pagination (slice)
  const handleNextPage = () => {
    if (isServerSearch) {
      // server returns pageSize items. If the current returned page has fewer than pageSize,
      // we assume it's the last page (you accepted this risk).
      if (flights.length < pageSize) return;
      fetchFilteredFlights(currentPage + 1);
    } else {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage === 0) return;
    if (isServerSearch) {
      fetchFilteredFlights(currentPage - 1);
    } else {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handleViewFlight = (flightId: number) => navigate(`/flights/${flightId}`);

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setSearchParams((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (d: Date | undefined) => {
    if (d) setSearchParams((prev) => ({ ...prev, departureDate: format(d, "yyyy-MM-dd") }));
    setDate(d);
  };

  const toggleAirline = (airline: string) => {
    setSelectedAirlines((prev) => (prev.includes(airline) ? prev.filter((a) => a !== airline) : [...prev, airline]));
  };

  const toggleSelectAllAirlines = () => {
    setSelectedAirlines((prev) => (prev.length === airlines.length ? [] : [...airlines]));
  };

  const calculateDuration = (departureTime: string, arrivalTime: string) => {
    const dep = new Date(departureTime);
    const arr = new Date(arrivalTime);
    const diffMs = arr.getTime() - dep.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs}h ${diffMins}m`;
  };

  // Pagination display:
  // - if server-mode, flights already hold the current page
  // - else slice the full flights list for client pagination
  const paginatedFlights = isServerSearch ? flights : flights.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  // Next button disabled logic:
  // - server-mode: disable when returned page length < pageSize (assume last)
  // - client-mode: disable when next would exceed local results
  const isNextDisabled = isServerSearch ? flights.length < pageSize : (currentPage + 1) * pageSize >= flights.length;
  const isPrevDisabled = currentPage === 0;

  const clearFilters = () => {
    setSearchParams({ fromAirport: "", toAirport: "", departureDate: format(new Date(), "yyyy-MM-dd") });
    setSelectedAirlines([]);
    setFareRange([0, 10000]);
    setMinSeats("");
    setIsServerSearch(false);
    fetchAllFlights();
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Search Flights</h1>

      {/* Search Form */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            {/* From */}
            <div className="space-y-2">
              <Label>From</Label>
              <select name="fromAirport" value={searchParams.fromAirport} onChange={handleInputChange} className="w-full border rounded px-2 py-1">
                <option value="">Select Departure Airport</option>
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            {/* To */}
            <div className="space-y-2">
              <Label>To</Label>
              <select name="toAirport" value={searchParams.toAirport} onChange={handleInputChange} className="w-full border rounded px-2 py-1">
                <option value="">Select Destination Airport</option>
                {airports.map((a) => (
                  <option key={a.code} value={a.code}>
                    {a.name} ({a.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label>Departure Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={handleDateChange} />
                </PopoverContent>
              </Popover>
            </div>

            {/* Search + Filters */}
            <div className="md:col-span-3 flex gap-2 mt-4">
              <Button onClick={handleSearch} className="flex items-center gap-2">
                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : <Plane className="h-4 w-4" />}
                Search
              </Button>

              <Popover open={filtersOpen} onOpenChange={setFiltersOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline">
                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 p-4 space-y-4">
                  {/* Airlines */}
                  <div>
                    <Label>Airlines</Label>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox checked={selectedAirlines.length === airlines.length} onCheckedChange={toggleSelectAllAirlines} />
                        <span>Select All</span>
                      </div>
                      {airlines.map((a) => (
                        <div key={a} className="flex items-center space-x-2">
                          <Checkbox checked={selectedAirlines.includes(a)} onCheckedChange={() => toggleAirline(a)} />
                          <span>{a}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Fare Range</Label>
                    <Slider value={fareRange} onValueChange={setFareRange} max={10000} step={500} />
                    <div className="flex justify-between text-sm mt-1">
                      <span>₹{fareRange[0]}</span>
                      <span>₹{fareRange[1]}</span>
                    </div>
                  </div>

                  <div>
                    <Label>Minimum Seats</Label>
                    <input type="number" value={minSeats} onChange={(e) => setMinSeats(e.target.value)} className="w-full border rounded px-2 py-1" min={0} />
                  </div>

                  <Button className="w-full" onClick={handleSearch}>
                    Apply Filters
                  </Button>
                  <Button variant="ghost" className="w-full" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight Results */}
      <div className="space-y-4">
        {isLoading && <div className="text-center py-4">Loading flights...</div>}
        {!isLoading && flights.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold">{isServerSearch ? `Showing page ${currentPage + 1}` : `${flights.length} Flights Found`}</h2>

            <AnimatePresence>
              {paginatedFlights.map((flight) => (
                <motion.div key={flight.flightId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
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
                            <div className="text-sm text-muted-foreground">{calculateDuration(flight.departureTime, flight.arrivalTime)}</div>
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
                          <Badge variant={flight.availableSeats > 30 ? "outline" : "secondary"}>{flight.availableSeats} seats left</Badge>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="bg-muted/20 p-4 flex justify-end">
                      <Button onClick={() => handleViewFlight(flight.flightId)}>View Details</Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Pagination */}
            <div className="flex justify-between mt-6">
              <Button onClick={handlePrevPage} disabled={isPrevDisabled}>
                Previous
              </Button>
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">Page {currentPage + 1}{isServerSearch ? "" : ` of ${Math.max(1, Math.ceil(flights.length / pageSize))}`}</span>
                <Button onClick={handleNextPage} disabled={isNextDisabled}>
                  Next
                </Button>
              </div>
            </div>
          </>
        )}

        {!isLoading && flights.length === 0 && <div className="text-center py-4">No Flights Found</div>}
      </div>
    </div>
  );
};

export default SearchPage;





























