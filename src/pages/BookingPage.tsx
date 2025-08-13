import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard } from 'lucide-react';
import { format } from 'date-fns';
import { PassengerInfo, Flight } from '@/types.ts';
import { useAppSelector } from '../store/store';
import api from '@/lib/axiosApi';
import { toast } from 'sonner';

// Passenger form schema
const passengerSchema = z.object({
  firstName: z.string().min(1, { message: 'First name is required' }),
  lastName: z.string().min(1, { message: 'Last name is required' }),
  age: z.coerce.number().int().min(0).max(120),
  gender: z.string().min(1, { message: 'Gender is required' }),
});

// Payment form schema
const paymentSchema = z.object({
  cardNumber: z.string().regex(/^\d{16}$/, { message: 'Card number must be 16 digits' }),
  cardholderName: z.string().min(1, { message: 'Cardholder name is required' }),
  expiryMonth: z.string().min(1, { message: 'Month is required' }),
  expiryYear: z.string().min(1, { message: 'Year is required' }),
  cvv: z.string().regex(/^\d{3}$/, { message: 'CVV must be 3 digits' }),
});

type PassengerFormValues = z.infer<typeof passengerSchema>;
type PaymentFormValues = z.infer<typeof paymentSchema>;

const BookingPage = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [passengers, setPassengers] = useState<PassengerInfo[]>([]);
  const [flight, setFlight] = useState<Flight | null>(null);
  const [numberOfTickets, setNumberOfTickets] = useState(1);
  const [seatClass, setSeatClass] = useState('ECONOMY');
  const { customer } = useAppSelector((state) => state.auth);

  const passengerForm = useForm<PassengerFormValues>({
    resolver: zodResolver(passengerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      age: 30,
      gender: '',
    },
  });
  
  const paymentForm = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: '',
      cardholderName: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
    },
  });

  // Fetch flight details from API when the page loads
  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        const response = await api.get(`/api/flights/${flightId}`);
        setFlight(response.data);
      } catch (error) {
        console.error("Error fetching flight details:", error);
        toast.error("Failed to load flight details.");
        navigate('/search');
      }
    };
    fetchFlightDetails();
  }, [flightId, navigate]);

  const onAddPassenger = (data: PassengerFormValues) => {
    setPassengers([...passengers, data as PassengerInfo]);
    passengerForm.reset();

    if (passengers.length + 1 >= numberOfTickets) {
      setCurrentStep(2);
    }
  };

  const onPaymentSubmit = async (data: PaymentFormValues) => {
    setIsFormLoading(true);

    if (!flight || !customer) {
      toast.error("Booking failed. Please try again.");
      setIsFormLoading(false);
      return;
    }

    try {
      const passengerInfoDTOs = passengers.map(p => ({
        fullName: `${p.firstName} ${p.lastName}`,
        age: p.age,
        gender: p.gender,
        seatNumber: p.seatPreference || 'N/A',
      }));

      const bookingData = {
        customerId: customer.customerId,
        flightId: Number(flightId),
        journeyDate: format(new Date(flight.departureTime), "yyyy-MM-dd"),
        seatClass: seatClass,
        passengers: passengerInfoDTOs,
        paymentMode: 'Credit Card',
      };

      console.log('Booking payload:', bookingData);

      const response = await api.post("/api/tickets/book", bookingData);
      const bookingResponse = response.data;

      toast.success("Booking successful!");

      navigate('/booking-success', {
        state: {
          bookingId: bookingResponse.bookingId,
          flightNumber: flight.flightNumber,
        }
      });
    } catch (error) {
      console.error("Booking failed:", error);
      toast.error("Booking failed. Please try again.");
    } finally {
      setIsFormLoading(false);
    }
  };

  const handleRemovePassenger = (index: number) => {
    const updatedPassengers = [...passengers];
    updatedPassengers.splice(index, 1);
    setPassengers(updatedPassengers);
  };

  const calculateTotalFare = () => {
    if (!flight) return 0;
    return flight.baseFare * numberOfTickets;
  };

  const calculateTaxes = () => {
    return Math.round(calculateTotalFare() * 0.18);
  };

  const calculateGrandTotal = () => {
    return calculateTotalFare() + calculateTaxes();
  };

  if (!flight) {
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
      <h1 className="text-3xl font-bold mb-2">Book Flight</h1>
      <p className="text-muted-foreground mb-6">
        {flight.airlineName} - {flight.flightNumber} | {flight.fromAirport} to {flight.toAirport} |
        {format(new Date(flight.departureTime), " MMM d, yyyy")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Passenger Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1">Number of Tickets</label>
                      <Select
                        value={numberOfTickets.toString()}
                        onValueChange={(value) => setNumberOfTickets(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem
                              key={num}
                              value={num.toString()}
                              disabled={num > flight.availableSeats}
                            >
                              {num} {num === 1 ? 'Passenger' : 'Passengers'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground mt-1">
                        {flight.availableSeats} seats available on this flight
                      </p>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium mb-1">Seat Class</label>
                      <Select
                        value={seatClass}
                        onValueChange={(value) => setSeatClass(value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select seat class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ECONOMY">Economy</SelectItem>
                          <SelectItem value="FIRST">First Class</SelectItem>
                          <SelectItem value="BUSINESS">Business Class</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Added Passengers List */}
                {passengers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-2">Added Passengers</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Age</TableHead>
                          <TableHead>Gender</TableHead>
                          <TableHead>Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {passengers.map((passenger, index) => (
                          <TableRow key={index}>
                            <TableCell>{passenger.firstName} {passenger.lastName}</TableCell>
                            <TableCell>{passenger.age}</TableCell>
                            <TableCell>{passenger.gender}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePassenger(index)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {passengers.length < numberOfTickets && (
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      Add Passenger {passengers.length + 1} of {numberOfTickets}
                    </h3>

                  <Form {...passengerForm}>
                      <form onSubmit={passengerForm.handleSubmit(onAddPassenger)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={passengerForm.control}
                            name="firstName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passengerForm.control}
                            name="lastName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={passengerForm.control}
                            name="age"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Age</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0"
                                    max="120"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={passengerForm.control}
                            name="gender"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Gender</FormLabel>
                                <Select
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <Button type="submit">
                          {passengers.length === numberOfTickets - 1
                            ? "Add & Continue to Payment"
                            : "Add Passenger"}
                        </Button>
                      </form>
                    </Form>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4">
                    <FormField
                      control={paymentForm.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="1234 5678 9012 3456"
                              {...field}
                              maxLength={16}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={paymentForm.control}
                      name="cardholderName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cardholder Name</FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={paymentForm.control}
                        name="expiryMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Month</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                  <SelectItem
                                    key={month}
                                    value={month.toString().padStart(2, '0')}
                                  >
                                    {month.toString().padStart(2, '0')}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="expiryYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Year</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="YY" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                  <SelectItem
                                    key={year}
                                    value={year.toString().slice(-2)}
                                  >
                                    {year}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={paymentForm.control}
                        name="cvv"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVV</FormLabel>
                            <FormControl>
                              <Input
                                type="password"
                                placeholder="123"
                                {...field}
                                maxLength={3}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                        Back to Passengers
                      </Button>
                      <Button type="submit" className="flex-1" disabled={isFormLoading}>
                        {isFormLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay ₹{calculateGrandTotal()}
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Booking Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Flight Details</h3>
                <div className="text-sm space-y-1 mt-2">
                  <p><span className="text-muted-foreground">Airline:</span> {flight?.airlineName}</p>
                  <p><span className="text-muted-foreground">Flight:</span> {flight?.flightNumber}</p>
                  <p>
                    <span className="text-muted-foreground">Date:</span> {flight ? format(new Date(flight.departureTime), "MMM d, yyyy") : 'N/A'}
                  </p>
                  <p>
                    <span className="text-muted-foreground">Time:</span> {flight ? format(new Date(flight.departureTime), "HH:mm") : 'N/A'} - {flight ? format(new Date(flight.arrivalTime), "HH:mm") : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Route</h3>
                <div className="text-sm space-y-1 mt-2">
                  <p><span className="text-muted-foreground">From:</span> {flight?.fromAirport}</p>
                  <p><span className="text-muted-foreground">To:</span> {flight?.toAirport}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Passengers</h3>
                <p className="text-sm mt-2">
                  {passengers.length} of {numberOfTickets} added
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Price Details</h3>
                <div className="space-y-2 mt-2">
                  <div className="flex justify-between text-sm">
                    <span>Base Fare ({numberOfTickets} × ₹{flight?.baseFare})</span>
                    <span>₹{calculateTotalFare()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxes & Fees</span>
                    <span>₹{calculateTaxes()}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total Amount</span>
                    <span>₹{calculateGrandTotal()}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingPage;