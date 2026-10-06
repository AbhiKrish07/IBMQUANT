// API Configuration for Q-UPI Sentinel Frontend Console

export const API_BASE_URL = 'http://localhost:32000';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API call to ${endpoint} failed with status ${response.status}`);
  }

  return response.json();
}
