// API Configuration for Q-UPI Sentinel Frontend Console

// Vite can proxy a relative URL in production, while local development uses
// the bundled Flask server unless VITE_API_BASE_URL is explicitly supplied.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002';

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
    const detail = await response.text();
    throw new Error(`API call to ${endpoint} failed with status ${response.status}: ${detail}`);
  }

  return response.json();
}
