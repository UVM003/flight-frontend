import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSelector } from "../store/store";
const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { customer, isAuthenticated } = useAppSelector((state) => state.auth);
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        <Link to="/" className="flex items-center space-x-3 relative">
  <img 
    src="/logo_transparent.png"
    alt="SkyConnect Logo" 
    className="h-16 w-auto object-contain scale-150 transform -translate-y-1" 
    style={{ transformOrigin: "left center" }}
  />
  <span className="text-2xl font-bold text-primary">Sky Connect</span>
</Link>

        
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6 text-lg">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/search" className="hover:text-primary">Search Flights</Link>
          {customer?.role === "CUSTOMER" && <Link to="/bookings" className="hover:text-primary">My Bookings</Link>}
          {customer?.role === "ADMIN" && <Link to="/addFlight" className="hover:text-primary">Add Flight</Link>}
          <Link to="/profile" className="hover:text-primary">Profile</Link>
          {customer?.role == null ? (
            <>
              <Link to="/login" className="hover:text-primary">Login</Link>
             <Link to="/register" className="hover:text-primary">Register</Link>
           </>
         ) : null}
        </div>

        {/* Mobile menu button */}
        <button 
          className="md:hidden p-2 rounded hover:bg-gray-100"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow-md">
          <div className="flex flex-col space-y-2 px-4 py-3 text-lg">
            <Link to="/" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>Home</Link>
            <Link to="/search" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>Search Flights</Link>
            <Link to="/bookings" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>My Bookings</Link>
            <Link to="/profile" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>Profile</Link>
            <Link to="/login" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" className="block hover:text-primary" onClick={() => setMenuOpen(false)}>Register</Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
