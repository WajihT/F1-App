const API_BASE_URL = 'http://192.168.0.186:8000'; // Use your FastAPI backend URL

export async function fetchDriverStandings(year: number) {
  const response = await fetch(`${API_BASE_URL}/api/standings/drivers?year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch driver standings');
  return await response.json();
}

export async function fetchConstructorStandings(year: number) {
  const response = await fetch(`${API_BASE_URL}/api/standings/teams?year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch constructor standings');
  return await response.json();
}

export async function fetchRaceResults(year: number) {
  const response = await fetch(`${API_BASE_URL}/api/results/races?year=${year}`);
  if (!response.ok) throw new Error('Failed to fetch race results');
  return await response.json();
}

export async function fetchSpecificRaceResults(year: number, eventSlug: string, session: string) {
  const response = await fetch(`${API_BASE_URL}/api/results/race/${year}/${eventSlug}?session=${session}`);
  if (!response.ok) throw new Error('Failed to fetch specific race results');
  return await response.json();
}

export async function fetchSchedule(year: number) {
  const response = await fetch(`${API_BASE_URL}/api/schedule/${year}`);
  if (!response.ok) throw new Error('Failed to fetch schedule');
  return await response.json();
}

export async function fetchAvailableSessions(year: number, event: string) {
  const response = await fetch(`${API_BASE_URL}/api/sessions?year=${year}&event=${encodeURIComponent(event)}`);
  if (!response.ok) throw new Error('Failed to fetch available sessions');
  return await response.json();
}

// Add other API calls as needed, matching your FastAPI endpoints