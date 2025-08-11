import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NavBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-primary">
          FlightBooker
        </Link>
        
        {/* Desktop menu */}
        <div className="hidden md:flex space-x-6">
          <Link to="/" className="hover:text-primary">Home</Link>
          <Link to="/search" className="hover:text-primary">Search Flights</Link>
          <Link to="/bookings" className="hover:text-primary">My Bookings</Link>
          <Link to="/profile" className="hover:text-primary">Profile</Link>
          <Link to="/login" className="hover:text-primary">Login</Link>
          <Link to="/register" className="hover:text-primary">Register</Link>
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
          <div className="flex flex-col space-y-2 px-4 py-3">
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
