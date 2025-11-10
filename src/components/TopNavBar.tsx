"use client";
import { useRouter } from "next/navigation";

interface TopNavBarProps {
  title?: string;
}

export default function TopNavBar({ title }: TopNavBarProps) {
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
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {title && (
            <h1 className="text-2xl font-bold text-gray-700">{title}</h1>
          )}
          <button
            onClick={handleLogout}
            className="text-gray-600 hover:text-red-600 font-medium cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
