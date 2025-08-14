import jsPDF from "jspdf";
import airlineLogo from "/logo_transparent.png?url"; // if in src/assets

export const downloadETicket = (booking) => {
  const doc = new jsPDF();

  // ===== Header background =====
  doc.setFillColor(30, 144, 255);
  doc.rect(0, 0, 210, 25, "F");



  // ===== Load and Add Logo =====
  const img = new Image();
  img.src = airlineLogo;
  img.onload = () => {
    // Place logo on top-left of header
    doc.addImage(img, "PNG", 10, 5, 25, 25); // Width & height increased for visibility

    // ===== Title =====
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Sky Connect Airlines - E-Ticket", 40, 16); // Shifted right to avoid overlapping logo

    // ===== Body =====
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);

    let y = 35;

    if (booking.bookingStatus === "CONFIRMED") {
      doc.setFont("helvetica", "bold");
      doc.text("Dear Customer,", 10, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text("Your flight ticket has been successfully booked.", 10, y);
      y += 10;

      // Booking Info Box
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.2);
      doc.rect(10, y, 190, 50);

      doc.setFont("helvetica", "bold");
      doc.text(`Booking ID:`, 15, y + 8);
      doc.text(`Flight Number:`, 15, y + 18);
      doc.text(`Journey Date:`, 15, y + 28);
      doc.text(`Total Fare:`, 15, y + 38);
      doc.text(`Assigned Seat(s):`, 15, y + 48);

      doc.setFont("helvetica", "normal");
      doc.text(booking.bookingId, 60, y + 8);
      doc.text(booking.flightNumber, 60, y + 18);
      doc.text(booking.journeyDate, 60, y + 28);
      doc.text(`₹${booking.totalFare.toFixed(2)}`, 60, y + 38);

      const assignedSeats = booking.passengers
        .map((p) => p.seatPreference || "N/A")
        .join(", ");
      doc.text(assignedSeats, 60, y + 48);

      y += 65;
      doc.text("Thank you for choosing our service.", 10, y);
    } else if (booking.bookingStatus === "CANCELLED") {
      doc.setFont("helvetica", "bold");
      doc.text("Dear Customer,", 10, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Your ticket with booking ID ${booking.bookingId} has been cancelled successfully.`,
        10,
        y
      );
      y += 20;
      doc.text("Thank you.", 10, y);
    } else {
      doc.setFont("helvetica", "normal");
      doc.text(
        "E-Ticket is only available for confirmed or cancelled bookings.",
        10,
        y
      );
    }

    // ===== Footer =====
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      "For support, contact: support@skyConnect.com | © SkyConnect Airlines",
      10,
      290
    );

    // ===== Save PDF =====
    doc.save(`E-Ticket_${booking.bookingId}.pdf`);
  };
};
