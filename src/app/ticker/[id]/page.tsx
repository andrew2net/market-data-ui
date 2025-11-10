"use client";

import { useParams, useRouter } from "next/navigation";
import TickerDetail from "../../../components/TickerDetail";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const tickerId = params.id as string;

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <TickerDetail tickerId={tickerId} onBack={handleBack} />
    </div>
  );
}
