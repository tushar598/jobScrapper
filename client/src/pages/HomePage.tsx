import React from "react";
import { Link } from "react-router-dom";
const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-900">
      <h1 className="text-4xl font-bold mb-6">Welcome to My Homepage</h1>

      <p className="text-lg mb-8 text-center max-w-md">
        This is a simple React + TypeScript page to get you started.
      </p>

      <Link
        to="/login"
        className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg shadow-md hover:bg-blue-700 transition-all"
      >
        Get Started
      </Link>
    </div>
  );
};

export default HomePage;
