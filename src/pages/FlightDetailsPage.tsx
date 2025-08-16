import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Plane, Clock, Calendar, Users, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";

import { useAppSelector } from "../store/store"; 
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import api from "@/lib/axiosApi";

interface Flight {
  flightId: number;
  flightNumber: string;
  airlineName: string;
  fromAirport: string;
  toAirport: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  baseFare: number;
}

const FlightDetailsPage = () => {
  const { flightId } = useParams<{ flightId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [flight, setFlight] = useState<Flight | null>(null);

  // Admin-related state
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { customer } = useAppSelector((state) => state.auth);

  // Fetch flight details
  useEffect(() => {
    if (!flightId) return;

    const fetchFlightDetails = async () => {
      try {
        const response = await fetch(`http://localhost:8086/api/flights/${flightId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setFlight(data);
      } catch (error) {
        console.error("Error fetching flight details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFlightDetails();
  }, [flightId]);

  // Booking navigation (anyone can click)
  const handleBookNow = () => {
    navigate(`/booking/${flightId}`);
  };

  // Admin actions
  const handleUpdateFlight = () => navigate(`/update/${flightId}`);
  const handleConfirmDelete = () => {
    setLoading(true);
    api
      .delete(`/api/flights/${parseInt(flightId || "0")}`)
      .then(() => {
        toast.success("Flight deleted successfully!", { duration: 1500 });
        setOpen(false);
        navigate("/search"); // Redirect after deletion
      })
      .catch((error) => {
        console.error("Error deleting flight:", error);
        toast.error("Failed to delete flight.", { duration: 1500 });
      })
      .finally(() => setLoading(false));
  };

  // Calculate duration
  const calculateDuration = () => {
    if (!flight) return "";
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

  if (!flight) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <p className="text-red-500">Flight not found.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        ← Back to Search Results
      </Button>

      <h1 className="text-3xl font-bold mb-6">Flight Details</h1>

      <Card className="mb-8">
        <CardContent className="pt-6 space-y-6">
          {/* Flight header */}
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
              <h2 className="text-2xl font-semibold">{flight.airlineName}</h2>
              <p className="text-muted-foreground">{flight.flightNumber}</p>
            </div>
            <div className="text-2xl font-bold">₹{flight.baseFare}</div>
          </div>

          <Separator />

          {/* Flight journey */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start justify-items-center">
            {/* Departure */}
            <div className="space-y-1 text-left w-full max-w-xs">
              <p className="text-muted-foreground text-sm">Departure</p>
              <p className="text-2xl font-semibold">{format(new Date(flight.departureTime), "HH:mm")}</p>
              <p className="font-medium">{flight.fromAirport}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(flight.departureTime), "EEEE, MMMM d, yyyy")}</p>
            </div>

            {/* Duration */}
            <div className="flex flex-col items-center text-center w-full max-w-lg">
              <p className="text-muted-foreground mb-2">{calculateDuration()}</p>
              <div className="relative w-full flex items-center">
                <span className="flex-1 border-t border-dashed border-gray-400"></span>
                <Plane className="h-4 w-4 mx-2 text-gray-500" />
                <span className="flex-1 border-t border-dashed border-gray-400"></span>
              </div>
              <p className="text-muted-foreground mt-2">Direct Flight</p>
            </div>

            {/* Arrival */}
            <div className="space-y-1 text-left w-full max-w-xs">
              <p className="text-muted-foreground text-sm">Arrival</p>
              <p className="text-2xl font-semibold">{format(new Date(flight.arrivalTime), "HH:mm")}</p>
              <p className="font-medium">{flight.toAirport}</p>
              <p className="text-sm text-muted-foreground">{format(new Date(flight.arrivalTime), "EEEE, MMMM d, yyyy")}</p>
            </div>
          </div>

          <Separator />

          {/* Flight details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{format(new Date(flight.departureTime), "MMM d, yyyy")}</p>
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
                <p className="text-sm text-muted-foreground">There are no available seats for this flight.</p>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="bg-muted/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl font-bold">Price: ₹{flight.baseFare}</div>

          
          {customer?.role === "ADMIN" ? (
            <div className="md:flex md:gap-2">
              <Button size="lg" onClick={handleUpdateFlight} disabled={flight.availableSeats === 0}>
                Update Details
              </Button>
              <Button size="lg" className="mt-2 md:mt-0 bg-red-700 hover:bg-red-600" onClick={() => setOpen(true)} disabled={flight.availableSeats === 0}>
                Delete Flight
              </Button>
            </div>
          ) : (<Button size="lg" onClick={handleBookNow} disabled={flight.availableSeats === 0}>
            Book Now
          </Button>)}
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete flight <b>{flightId}</b>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              No
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete} disabled={loading}>
              {loading ? "Deleting..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlightDetailsPage;
