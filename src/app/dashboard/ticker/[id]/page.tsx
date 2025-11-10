"use client";

import { useParams, useRouter } from "next/navigation";
import TickerDetail from "../../../../components/TickerDetail";

export default function TickerPage() {
  const params = useParams();
  const router = useRouter();
  const tickerId = params.id as string;

  const handleBack = () => {
    router.push('/dashboard');
  };

  return <TickerDetail tickerId={tickerId} onBack={handleBack} />;
}
