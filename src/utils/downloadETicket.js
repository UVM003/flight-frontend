import jsPDF from "jspdf";
import airlineLogo from "/logo_transparent.png"; 
import { format } from "date-fns";

// INR formatting without ₹
const formatCurrency = (value) =>
  `Rs. ${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export const downloadETicket = (booking) => {
  const doc = new jsPDF();
  let y = 0;

  // ===== Header background =====
  doc.setFillColor(30, 144, 255);
  doc.rect(0, 0, 210, 25, "F");

  // ===== Add Logo =====
  doc.addImage(airlineLogo, "PNG", 10, 5, 25, 15);

  // ===== Title =====
  doc.setTextColor(255, 255, 255);
  doc.setFont("times", "bold");
  doc.setFontSize(18);
  doc.text("Sky Connect Airlines - E-Ticket", 40, 16);

  // Reset for content
  doc.setTextColor(0, 0, 0);
  doc.setFont("times", "normal");
  doc.setFontSize(12);
  y = 35;

  if (booking.bookingStatus === "CONFIRMED") {
    doc.setFont("times", "bold");
    doc.text("Dear Customer,", 10, y);
    y += 10;
    doc.setFont("times", "normal");
    doc.text("Your flight ticket has been successfully booked.", 10, y);
    y += 10;

    // ===== Booking Summary Box =====
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.2);
    doc.rect(10, y, 190, 50);

    doc.setFont("times", "bold");
    doc.text("Booking ID:", 15, y + 8);
    doc.text("Flight Number:", 15, y + 18);
    doc.text("Journey Date:", 15, y + 28);
    doc.text("Total Fare:", 15, y + 38);
    doc.text("Assigned Seat(s):", 15, y + 48);

    doc.setFont("times", "normal");
    doc.text(booking.bookingId, 60, y + 8);
    doc.text(booking.flightNumber, 60, y + 18);
    doc.text(format(new Date(booking.journeyDate + "T00:00:00"), "MMM d, yyyy"), 60, y + 28);
    doc.text(formatCurrency(booking.totalFare), 60, y + 38);

    const assignedSeats = booking.passengers.map((p) => p.seatNumber || "N/A").join(", ");
    doc.text(assignedSeats, 60, y + 48);

    y += 65;

    // ===== Flight Information =====
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Flight Information", 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("Departure:", 10, y + 5);
    doc.text(format(new Date(booking.departureTime), "HH:mm") + " from " + booking.fromAirport, 60, y + 5);
    doc.text(format(new Date(booking.departureTime), "MMM d, yyyy"), 150, y + 5);
    y += 10;
    doc.text("Arrival:", 10, y + 5);
    doc.text(format(new Date(booking.arrivalTime), "HH:mm") + " at " + booking.toAirport, 60, y + 5);
    doc.text(format(new Date(booking.arrivalTime), "MMM d, yyyy"), 150, y + 5);
    y += 15;

    // ===== Passenger Information Table =====
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Passenger Information", 10, y);
    y += 8;

    const tableHeaders = ["Name", "Age", "Gender", "Seat"];
    const colWidths = [90, 20, 30, 30];
    const tableX = 10;

    // Draw header row
    doc.setFontSize(10);
    doc.setFont("times", "bold");
    let xPos = tableX;
    tableHeaders.forEach((header, i) => {
      doc.rect(xPos, y, colWidths[i], 8);
      doc.text(header, xPos + 2, y + 6);
      xPos += colWidths[i];
    });
    y += 8;

    // Draw passenger rows
    doc.setFont("times", "normal");
    booking.passengers.forEach((p) => {
      // Page break check
      if (y + 8 > 280) {
        doc.addPage();
        y = 20;
        xPos = tableX;
        doc.setFont("times", "bold");
        tableHeaders.forEach((header, i) => {
          doc.rect(xPos, y, colWidths[i], 8);
          doc.text(header, xPos + 2, y + 6);
          xPos += colWidths[i];
        });
        y += 8;
        doc.setFont("times", "normal");
      }

      xPos = tableX;
      const rowData = [p.fullName, String(p.age), p.gender, p.seatNumber || "N/A"];
      rowData.forEach((cell, i) => {
        doc.rect(xPos, y, colWidths[i], 8);
        doc.text(cell, xPos + 2, y + 6);
        xPos += colWidths[i];
      });
      y += 8;
    });

    y += 10;

    // ===== Payment Information =====
    doc.setFont("times", "bold");
    doc.setFontSize(14);
    doc.text("Payment Information", 10, y);
    y += 8;
    doc.setFontSize(12);
    doc.setFont("times", "normal");
    doc.text("Total Passengers:", 10, y);
    doc.text(String(booking.totalPassengers), 200, y, { align: "right" });
    y += 7;
    doc.text("Base Fare:", 10, y);
    doc.text(formatCurrency(booking.totalFare * 0.85), 200, y, { align: "right" });
    y += 7;
    doc.text("Taxes & Fees:", 10, y);
    doc.text(formatCurrency(booking.totalFare * 0.15), 200, y, { align: "right" });
    y += 7;
    doc.line(10, y, 200, y);
    y += 5;
    doc.setFont("times", "bold");
    doc.text("Total Amount:", 10, y);
    doc.text(formatCurrency(booking.totalFare), 200, y, { align: "right" });
    y += 15;

    doc.setFont("times", "normal");
    doc.text("Thank you for choosing our service.", 10, y);

  } else if (booking.bookingStatus === "CANCELLED") {
    doc.setFont("times", "bold");
    doc.text("Dear Customer,", 10, y);
    y += 10;
    doc.setFont("times", "normal");
    doc.text(
      `Your ticket with booking ID ${booking.bookingId} has been cancelled successfully.`,
      10,
      y
    );
    y += 20;
    doc.text("Thank you.", 10, y);
  } else {
    doc.setFont("times", "normal");
    doc.text("E-Ticket is only available for confirmed or cancelled bookings.", 10, y);
  }

  // ===== Footer =====
  doc.setFontSize(10);
  doc.setTextColor(150);
  doc.text(
    "For support, contact: support@skyConnect.com | © SkyConnect Airlines",
    10,
    290
  );

  // Save PDF
  doc.save(`E-Ticket_${booking.bookingId}.pdf`);
};
