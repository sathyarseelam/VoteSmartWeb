import { Link } from "react-router-dom";
import { Sun, Moon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Logo from "./Logo";

const Header = () => {

  return (
    <nav className="border-b border-gray-200 py-4 px-6 md:px-12">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Logo />
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-gray-700 hover:text-blue-600">Log In</Link>
          <Button onClick={() => {window.location.href = "/registration"}} className="bg-blue-600 hover:bg-blue-700 rounded-full px-5 py-2">Sign Up</Button>
        </div>
      </div>
    </nav>
  );
};

export default Header;