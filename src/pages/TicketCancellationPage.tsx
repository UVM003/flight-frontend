import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "sonner";
import { TicketCancellationService } from "@/lib/api";
import { differenceInCalendarDays } from "date-fns";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BookingTicketDetails {
  ticketId: number;
  bookingId: string;
  bookingDate: string;
  customerId: number;
  flightId: number;
  journeyDate: string;
  seatCount: number;
  status: string;
  totalFare: number;
}

interface CancellationTicketDetails {
  bookingId: string;
  journeyDate: string;
  totalFare: number;
  cancellationCharge: number;
  refundAmount: number;
  refundStatus: string;
  message: string;
}

enum VerificationStatus {
  IDLE,
  REQUESTED,
  VERIFIED,
  FAILED,
}

interface BackendError {
  timestamp: string;
  message: string;
  details: string;
  httpCodeMessage: string;
  error?: string;
}

// Type guard to check if an object is BackendError
function isBackendError(obj: any): obj is BackendError {
  return (
    obj &&
    typeof obj === "object" &&
    (("httpCodeMessage" in obj &&
      "message" in obj &&
      "timestamp" in obj &&
      "details" in obj) ||
      "error" in obj)
  );
}

const TicketCancellationPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { state } = useLocation();
  const { fromAirport, toAirport, bookingDate } = state || {};

  const [isLoading, setIsLoading] = useState(true);
  const [ticketDetails, setTicketDetails] =
    useState<BookingTicketDetails | null>(null);
  const [cancelResponse, setCancelResponse] =
    useState<CancellationTicketDetails | null>(null);
  const [verificationStatus, setVerificationStatus] =
    useState<VerificationStatus>(VerificationStatus.IDLE);
  const [otp, setOtp] = useState<string>("");
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");

  // Get the current date for OTP verification
  const currentDate = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
 const customerData = JSON.parse(localStorage.getItem("customer") || "{}");
const tokenFromCustomer = customerData.token;
const token = tokenFromCustomer;
  useEffect(() => {
    const fetchTicketDetails = async () => {
      setIsLoading(true);
      // Use the security token if available from local storage
      try {
        // const token = tokenFromCustomer|| "";
        const data = await TicketCancellationService.getTicketDetails(
          bookingId!,
          token
        );
        let response: BookingTicketDetails;
        if (isBackendError(data)) {
          console.error("Error message:", data);
          setErrorMessage("Failed to load ticket details. Please try again.");
          toast.error(data?.error ?? data?.message ?? data?.error);
        } else {
          // This is a valid JSON object of type YourDataType
          response = data as BookingTicketDetails;
          console.log("Valid data:", response);
          setTicketDetails(response);
          setErrorMessage("");
        }
      } catch (error) {
        console.error("Error message:", error);
        setErrorMessage("Failed to load ticket details. Please try again.");
        toast.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (bookingId) {
      fetchTicketDetails();
    }
  }, [bookingId]);

  const handleRequestOtp = async () => {
    setIsRequestingOtp(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Use the security token if available from local storage
      // const token = tokenFromCustomer|| "";
      const response = await TicketCancellationService.requestOtp(token);
      console.log(response);
      if (isBackendError(response)) {
        console.error("Error requesting OTP", response);
        setErrorMessage("Failed to send OTP. Please try again.");
        toast.error("Error sending OTP");
      } else {
        setVerificationStatus(VerificationStatus.REQUESTED);
        setSuccessMessage(
          "OTP sent successfully. Please check your registered email."
        );
        toast.success("OTP sent successfully");
        
      }
    } catch (error) {
      console.error("Error requesting OTP:", error);
      setErrorMessage("Failed to send OTP. Please try again.");
      toast.error("Error sending OTP");
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.trim() === "") {
      setErrorMessage("Please enter a valid OTP");
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage("");
    setSuccessMessage("");

    // Use the security token if available from local storage
    // const token = tokenFromCustomer|| "";
    const data = await TicketCancellationService.verifyOtp(
      bookingId!,
      otp,
      currentDate,
      token
    );
    let response: CancellationTicketDetails;
    if (typeof data === "string" || isBackendError(data)) {
      console.error("Error message:", data);
      setErrorMessage(
        "OTP verification failed. Please check the OTP and try again."
      );
      toast.error(typeof data === "string" ? data : data.message);
    } else {
      // This is a valid JSON object of type YourDataType
      response = data as CancellationTicketDetails;
      console.log("Valid data:", response);
      setSuccessMessage(response.message);
      toast.success("Ticket cancelled successfully");
      setErrorMessage("");
      setVerificationStatus(VerificationStatus.VERIFIED);
    }

    setIsVerifyingOtp(false);
  };

  if (isLoading) {
    return (
      <div className="container py-8 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p>Loading ticket details...</p>
        </div>
      </div>
    );
  }

  const today = new Date();
  const journeyDate = new Date(ticketDetails?.journeyDate);
  const daysBeforeBooking = differenceInCalendarDays(journeyDate, today);

  let cancellationRate = 0;
  if (daysBeforeBooking > 10) {
    cancellationRate = 0.1;
  } else if (daysBeforeBooking > 5) {
    cancellationRate = 0.2;
  } else if (daysBeforeBooking > 1) {
    cancellationRate = 0.5;
  } else {
    cancellationRate = 1.0;
  }

  const totalFare = ticketDetails?.totalFare ?? 0;
  const cancellationCharge = Math.round(totalFare * cancellationRate);
  const refundAmount = Math.max(totalFare - cancellationCharge, 0);

  const displayedTotalFare = totalFare;
  const cancellationChargeDisplay = `₹${cancellationCharge}`;
  const refundAmountDisplay = `₹${refundAmount}`;

  return (
    <div className="container py-8">
      <Button
        variant="ghost"
        className="mb-4 flex items-center"
        onClick={() => navigate("/bookings")}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to My Bookings
      </Button>

      <h1 className="text-3xl font-bold mb-2">Ticket Cancellation</h1>
      <p className="text-muted-foreground mb-6">
        Review and confirm your ticket cancellation
      </p>

      {/* Show error alert if an error exists */}
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-6 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Booking Details</CardTitle>
              <CardDescription>
                Booking ID:{" "}
                {ticketDetails?.bookingId ?? cancelResponse?.bookingId ?? "N/A"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Booking Date</p>
                  <p className="font-medium">
                    {bookingDate
                      ? format(new Date(bookingDate), "MMM d, yyyy")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Journey Date</p>
                  <p className="font-medium">
                    {cancelResponse?.journeyDate || ticketDetails?.journeyDate
                      ? format(
                          new Date(ticketDetails.journeyDate),
                          "MMM d, yyyy"
                        )
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">From</p>
                  <p className="font-medium">
                    {fromAirport ? fromAirport : "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">To</p>
                  <p className="font-medium">{toAirport ? toAirport : "N/A"}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold text-lg mb-4">
                  Payment & Refund Details
                </h3>
                <div className="bg-muted/30 p-4 rounded-md">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Total Fare</span>
                    <span>₹{displayedTotalFare}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">
                      Cancellation Charge
                    </span>
                    <span className="text-destructive">
                      {cancellationChargeDisplay}
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t mt-2 font-medium">
                    <span>Refund Amount</span>
                    <span className="text-green-600">
                      {refundAmountDisplay}
                    </span>
                  </div>
                </div>
                {cancelResponse && (
                  <div className="mt-4 text-sm">
                    <p>
                      <strong>Refund Status:</strong>{" "}
                      {cancelResponse.refundStatus}
                    </p>
                    <p className="mt-2">
                      <strong>Message:</strong> {cancelResponse.message}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex-col">
              {verificationStatus === VerificationStatus.VERIFIED ? (
                <div className="w-full flex justify-center">
                  <Button
                    className="w-full max-w-md"
                    onClick={() => navigate("/bookings")}
                  >
                    Return to My Bookings
                  </Button>
                </div>
              ) : (
                <div className="w-full space-y-4">
                  {verificationStatus === VerificationStatus.REQUESTED && (
                    <div className="flex flex-col md:flex-row gap-4">
                      <Input
                        type="text"
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="flex-1"
                        maxLength={6}
                      />
                      <Button
                        onClick={handleVerifyOtp}
                        disabled={isVerifyingOtp || !otp || otp.length < 6}
                        className="md:w-1/3"
                      >
                        {isVerifyingOtp ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Verifying
                          </>
                        ) : (
                          "Verify OTP"
                        )}
                      </Button>
                      {/* Resend OTP Button */}
                      <Button
                        variant="outline"
                        onClick={handleRequestOtp}
                        disabled={isRequestingOtp}
                        className="w-full md:w-auto"
                      >
                        {isRequestingOtp ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Resending OTP
                          </>
                        ) : (
                          "Resend OTP"
                        )}
                      </Button>
                    </div>
                  )}
                  {verificationStatus === VerificationStatus.IDLE && (
                    <Button
                      onClick={handleRequestOtp}
                      disabled={isRequestingOtp}
                      className="w-full"
                    >
                      {isRequestingOtp ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending OTP
                        </>
                      ) : (
                        "Send OTP to Confirm Cancellation"
                      )}
                    </Button>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>

        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy</CardTitle>
              <CardDescription>Terms & Conditions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Badge className="mb-2" variant="outline">
                  Before 10+ days
                </Badge>
                <p className="text-sm">
                  10% of the total fare will be deducted.
                </p>
              </div>
              <div>
                <Badge className="mb-2" variant="outline">
                  Before 5-9 days
                </Badge>
                <p className="text-sm">
                  20% of the total fare will be deducted.
                </p>
              </div>
              <div>
                <Badge className="mb-2" variant="outline">
                  Before 1-4 days
                </Badge>
                <p className="text-sm">
                  50% of the total fare will be deducted.
                </p>
              </div>
              <div className="pt-4 border-t text-sm text-muted-foreground">
                <p>
                  * Refund will be processed within 5-7 business days.
                  {/* {cancelResponse.message} */}
                </p>
                <p className="mt-2">
                  * Cancellation charges are calculated based on the date of
                  journey.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TicketCancellationPage;
