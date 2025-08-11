const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t mt-auto py-6">
      <div className="container mx-auto text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} FlightBooker. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
