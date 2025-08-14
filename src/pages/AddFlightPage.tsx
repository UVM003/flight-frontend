// UpdateFlightPage.tsx
import React, { useEffect, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import api from "@/lib/axiosApi";

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

// Validation schema
export const flightSchema = z
  .object({
    flightNumber: z
      .string()
      .min(1, { message: "Flight number is required" })
      .max(20, { message: "Flight number must be at most 20 characters" })
      .trim(),

    airlineName: z
      .string()
      .min(1, { message: "Airline name is required" })
      .max(100, { message: "Airline name must be at most 100 characters" })
      .trim(),

    fromAirport: z
      .string()
      .min(1, { message: "From airport is required" })
      .max(100, { message: "From airport must be at most 100 characters" })
      .trim(),

    toAirport: z
      .string()
      .min(1, { message: "To airport is required" })
      .max(100, { message: "To airport must be at most 100 characters" })
      .trim(),

    departureDate: z
      .string()
      .min(1, { message: "Departure date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" }),

    departureTime: z
      .string()
      .min(1, { message: "Departure time is required" })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)" }),

    arrivalDate: z
      .string()
      .min(1, { message: "Arrival date is required" })
      .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format (YYYY-MM-DD)" }),

    arrivalTime: z
      .string()
      .min(1, { message: "Arrival time is required" })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: "Invalid time format (HH:mm)" }),

    totalSeats: z.coerce
      .number({ invalid_type_error: "Total seats must be a number" })
      .int()
      .min(1, { message: "Total seats must be at least 1" }),

    availableSeats: z.coerce
      .number({ invalid_type_error: "Available seats must be a number" })
      .int()
      .min(0, { message: "Available seats cannot be negative" }),

    baseFare: z.coerce
      .number({ invalid_type_error: "Base fare must be a number" })
      .min(0, { message: "Base fare cannot be negative" })
      .multipleOf(0.01, { message: "Base fare must have at most 2 decimal places" }),
  })
  // Validation: From and To airports must not be the same
 .refine(
  (data) => data.fromAirport !== data.toAirport,
  {
    message: "From and To airports cannot be the same",
    path: ["toAirport"], // show the error on the 'toAirport' field
  }
)
  // Validation 1: Arrival datetime must be after departure datetime
  .refine(
    (data) => {
      const dep = new Date(`${data.departureDate}T${data.departureTime}`);
      const arr = new Date(`${data.arrivalDate}T${data.arrivalTime}`);
      return arr > dep;
    },
    {
      message: "Arrival date/time must be after departure date/time",
      path: ["arrivalDate"], // attach error to arrival date field
    }
  )
  // Validation 2: Available seats must not exceed total seats
  .refine(
    (data) => data.availableSeats <= data.totalSeats,
    {
      message: "Available seats cannot exceed total seats",
      path: ["availableSeats"],
    }
  );

  


type FlightFormValues = z.infer<typeof flightSchema>;

export default function AddFlightPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flightNumber: "",
      airlineName: "",
      fromAirport: "",
      toAirport: "",
      departureDate: "",
      departureTime: "",
      arrivalDate: "",
      arrivalTime: "",
      totalSeats: 0,
      availableSeats: 0,
      baseFare: 0,
    },
  });

  const onSubmit = (data: FlightFormValues) => {
    setIsLoading(true);
  
    // Combine date & time into ISO format
    const payload = {
      flightNumber: data.flightNumber,
      airlineName: data.airlineName,
      fromAirport: data.fromAirport,
      toAirport: data.toAirport,
      departureTime: `${data.departureDate}T${data.departureTime}`,
      arrivalTime: `${data.arrivalDate}T${data.arrivalTime}`,
      totalSeats: Number(data.totalSeats),
      availableSeats: Number(data.availableSeats),
      baseFare: Number(data.baseFare),
    };

    console.log("Sending payload to backend:", payload);

   api.post(`/api/flights`, payload)
     .then((response) => {
       toast.success("Flight updated successfully!", {
         duration: 1500, // 2 seconds
       });
        console.log("uploaded flight details:", response.data);
       form.reset()
     })
     .catch((error) => {
       console.error("Error updating flight:", error);
       toast.error("Failed to update flight.", {
         duration: 1500,
       });
     });
    setIsLoading(false);
    
  };

  return (
    <div className="container max-w-[60rem] py-10">
    
      <Card>
        <CardHeader>
          <CardTitle>Add Flight</CardTitle>
          <CardDescription className="mt-2">Fill in the details below</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

              {/* Flight Number */}
              <FormField
                control={form.control}
                name="flightNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Flight Number</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Airline Name */}
              <FormField
                control={form.control}
                name="airlineName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Airline Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* From & To Airports */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
  control={form.control}
  name="fromAirport"
  render={({ field }) => (
    <FormItem>
      <FormLabel>From Airport</FormLabel>
      <FormControl>
        <select
          {...field}
          disabled={isLoading}
          className="w-full border rounded-lg h-10 px-2 py-1"
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
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
           <FormField
  control={form.control}
  name="toAirport"
  render={({ field }) => (
    <FormItem>
      <FormLabel>To Airport</FormLabel>
      <FormControl>
        <select
          {...field}
          disabled={isLoading}
          className="w-full border rounded-lg h-10 px-2 py-1"
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
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
              </div>

              {/* Departure */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="departureDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departureTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departure Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Arrival */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="arrivalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="arrivalTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Arrival Time</FormLabel>
                      <FormControl>
                        <Input type="time" {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Seats & Fare */}
              <FormField
                control={form.control}
                name="totalSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Seats</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availableSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Seats</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="baseFare"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Fare</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Add Flight"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
