"use client";

import TopNavBar from "./TopNavBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <TopNavBar title="Dashboard" />
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
