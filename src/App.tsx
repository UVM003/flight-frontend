import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar.tsx';
import Footer from './components/Footer.tsx';
import HomePage from './pages/HomePage.tsx';
import SearchPage from './pages/SearchPage';
import FlightDetailsPage from './pages/FlightDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import BookingPage from './pages/BookingPage';
import BookingSuccessPage from './pages/BookingSuccessPage';
import MyBookingsPage from './pages/MyBookingsPage';
import NotFound from './pages/NotFound';
import UpdateFlightPage from './pages/UpdateFlightPage.tsx';
import { useEffect, useState } from 'react';
import AddFlightPage from './pages/AddFlightPage.tsx';
import { useDispatch } from "react-redux";
import { loginSuccess } from "./store/authSlice";
import TicketCancellationPage from './pages/TicketCancellationPage.tsx';

const queryClient = new QueryClient();

const App = () => {
    const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const customer = JSON.parse(localStorage.getItem("customer"));
    if (token && customer) {
      dispatch(loginSuccess({ token, customer }));
    }
  }, [dispatch]);
  
  return(
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/flights/:flightId" element={<FlightDetailsPage />} />
              <Route path="/login" element={<LoginPage />} /> 
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/booking/:flightId" element={<BookingPage />} />
              <Route path="/update/:flightId" element={<UpdateFlightPage />} />
              <Route path="/booking-success" element={<BookingSuccessPage />} />
              <Route path="/bookings" element={<MyBookingsPage />} />
              <Route path="/ticket-cancel/:bookingId" element={<TicketCancellationPage />} />
              <Route path="/addFlight" element={<AddFlightPage/>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);
}
export default App;