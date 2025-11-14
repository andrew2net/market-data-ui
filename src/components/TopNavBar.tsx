"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface TopNavBarProps {
  title?: string;
}

export default function TopNavBar({ title = "Market Data" }: TopNavBarProps) {
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
    <nav className="bg-background border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-muted-foreground hover:text-destructive hover:cursor-pointer"
          >
            Logout
          </Button>
        </div>
      </div>
    </nav>
  );
}
