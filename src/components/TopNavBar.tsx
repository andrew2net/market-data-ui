"use client";
import { useRouter } from "next/navigation";

export default function TopNavBar() {
  const router = useRouter();

  const handleLogout = () => {
    // Remove authentication tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('refreshToken');

    // Redirect to login page
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-md px-6 py-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Market Data</h2>
        <button
          onClick={handleLogout}
          className="text-gray-600 hover:text-red-600 font-medium cursor-pointer"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
