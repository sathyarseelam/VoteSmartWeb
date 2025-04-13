import { Link } from "react-router-dom";
import { Home, Users, Calendar, FileText, MapPin, BarChart3 } from "lucide-react";
import Logo from "@/components/Logo";

const Header = () => {
  return (
    <header className="border-b border-gray-200 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Left side: Logo */}
        <Logo />

        {/* Right side: Navigation + Utility Icons */}
        <div className="flex items-center space-x-8">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link
            to="/candidates"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <Users size={18} />
            <span>Candidates</span>
          </Link>
          <Link
            to="/policies"
            className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
          >
            <FileText size={18} />
            <span>My Policies</span>
          </Link>
          <button className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center">
            <span>A</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;