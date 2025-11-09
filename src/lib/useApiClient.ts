"use client";

import { useRouter } from 'next/navigation';
import { ApiClient } from './api';

export function useApiClient() {
  const router = useRouter();

  const apiClient = new ApiClient(
    process.env.NEXT_PUBLIC_API_URL || '',
    () => {
      // Handle 401 unauthorized - redirect to login
      router.push('/login');
    }
  );

  return apiClient;
}
