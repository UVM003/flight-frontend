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
import axios from "axios";
import api from "@/lib/axiosApi";
import { useAppSelector } from "../store/store";


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

 .refine(
  (data) => data.fromAirport !== data.toAirport,
  {
    message: "From and To airports cannot be the same",
    path: ["toAirport"],
  }
)
  
  .refine(
    (data) => {
      const dep = new Date(`${data.departureDate}T${data.departureTime}`);
      const arr = new Date(`${data.arrivalDate}T${data.arrivalTime}`);
      return arr > dep;
    },
    {
      message: "Arrival date/time must be after departure date/time",
      path: ["arrivalDate"], 
    }
  )

  .refine(
    (data) => data.availableSeats <= data.totalSeats,
    {
      message: "Available seats cannot exceed total seats",
      path: ["availableSeats"],
    }
  );

type FlightFormValues = z.infer<typeof flightSchema>;

export default function UpdateFlightPage() {

  const [flights, setFlights] = useState([])

     const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
 const [flight, setFlight] = useState(null);

  const form = useForm<FlightFormValues>({
    resolver: zodResolver(flightSchema),
    defaultValues: {
      flightNumber: '',
      airlineName: '',
      fromAirport: '',
      toAirport: '',
      departureDate: '',
      departureTime: '',
      arrivalDate: '',
      arrivalTime: '',
      totalSeats: 1,
      availableSeats: 0,
      baseFare: 0,
    },
  });

   useEffect(() => {
    if (!flightId) return;

    setIsLoading(true);
    api.get(`/api/flights/${flightId}`)
      .then((response) => {
        const f = response.data;
        setFlight(f);

        // split departure/arrival into date/time safely (handle missing values)
        const departureIso = f.departureTime ?? '';
        const arrivalIso = f.arrivalTime ?? '';

        const departureDate = departureIso ? departureIso.split("T")[0] : '';
        const departureTime = departureIso ? departureIso.split("T")[1].slice(0, 5) : '';
        const arrivalDate = arrivalIso ? arrivalIso.split("T")[0] : '';
        const arrivalTime = arrivalIso ? arrivalIso.split("T")[1].slice(0, 5) : '';

        // reset the form values with fetched data
        form.reset({
          flightNumber: f.flightNumber ?? '',
          airlineName: f.airlineName ?? '',
          fromAirport: f.fromAirport ?? '',
          toAirport: f.toAirport ?? '',
          departureDate,
          departureTime,
          arrivalDate,
          arrivalTime,
          totalSeats: parseInt(f.totalSeats) || 1,
          availableSeats: parseInt(f.availableSeats) || 0,
          baseFare: parseFloat(f.baseFare) || 0,
        });
      })
      .catch((error) => {
        console.error("Error fetching flight details:", error);
        toast.error("Failed to load flight details");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [flightId]);

  const onSubmit = (data: FlightFormValues) => {
    setIsLoading(true);
  
    // Combine date & time into ISO format
    const payload = {
      flightId: parseInt(flightId),
      flightNumber: data.flightNumber,
      airlineName: data.airlineName,
      fromAirport: data.fromAirport,
      toAirport: data.toAirport,
      departureTime: `${data.departureDate}T${data.departureTime}`,
      arrivalTime: `${data.arrivalDate}T${data.arrivalTime}`,
      totalSeats: data.totalSeats,
      availableSeats: data.availableSeats,
      baseFare: data.baseFare,
    };

    console.log("Sending payload to backend:", payload);

   api.put(`/api/flights/${parseInt(flightId)}`, payload)
     .then((response) => {
       toast.success("Flight updated successfully!", {
         duration: 1500, // 2 seconds
       });
        console.log("uploaded flight details:", response.data);
     })
     .catch((error) => {
       console.error("Error updating flight:", error);
       toast.error("Failed to update flight.", {
         duration: 1500,
       });
     });
    setIsLoading(false);
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
    <div className="container max-w-[60rem] py-10">
     <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        ← Back to Search Results
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Update Flight</CardTitle>
          <CardDescription className="mt-2">Modify flight details below</CardDescription>
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
                        <Input {...field} disabled={isLoading} />
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
                        <Input {...field} disabled={isLoading} />
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
                    Updating...
                  </>
                ) : (
                  "Update Flight"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
