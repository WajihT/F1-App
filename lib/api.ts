const API_BASE_URL = 'https://f1analytics-be-production.up.railway.app'; //Use this for prod: https://f1analytics-be-production.up.railway.app FastAPI backend URL 
// Use this for dev: http://192.168.0.186:8000

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

export async function fetchRaceResults(year: number, event: string, session: string) {
  const response = await fetch(`${API_BASE_URL}/api/results/race/${year}/${event}?session=${session}`);
  if (!response.ok) throw new Error('Failed to fetch race results');
  return await response.json();
}

export async function fetchRace(year: number) {
  const response = await fetch(`${API_BASE_URL}/api/results/races?year=${year}`);
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

export async function fetchLapPositions(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/lapdata/positions?${params.toString()}`;
  //console.log('fetchLapPositions URL:', url);
  const response = await fetch(url);
  console.log("Test: ", response);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to fetch lap positions: ${errorText}`);
  }
  return await response.json();
}

export async function fetchSessionIncidents(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/incidents?${params.toString()}`;
  const response = await fetch(url /*, { headers: getHeaders() }*/);
  if (!response.ok) throw new Error('Failed to fetch session incidents');
  return await response.json();
}

// Add other API calls as needed, matching your FastAPI endpoints
