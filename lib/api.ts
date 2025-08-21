const API_BASE_URL = 'https://f1analytics-be-production.up.railway.app'; //Use this for prod: https://f1analytics-be-production.up.railway.app FastAPI backend URL 
// Use this for dev: http://192.168.0.238:8000

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
  //console.log(response);
  //console.log("Test: ", response);
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

// Lap Time Data
export async function fetchLapTimes(year: number, event: string, session: string, drivers: string[]) {
  const params = new URLSearchParams({ 
    year: year.toString(), 
    event, 
    session 
  });
  
  // Add each driver as a separate query parameter
  drivers.forEach(driver => params.append('drivers', driver));
  
  const url = `${API_BASE_URL}/api/laptimes?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch lap times');
  return await response.json();
}

// Telemetry Data
export async function fetchSpeedData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/speed?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch speed data');
  return await response.json();
}

export async function fetchGearData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/gear?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch gear data');
  return await response.json();
}

export async function fetchThrottleData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/throttle?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch throttle data');
  return await response.json();
}

export async function fetchBrakeData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/brake?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch brake data');
  return await response.json();
}

export async function fetchRPMData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/rpm?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch RPM data');
  return await response.json();
}

export async function fetchDRSData(year: number, event: string, session: string, driverCode: string, lapNumber?: number) {
  const params = new URLSearchParams({ year: year.toString(), event, session, driver: driverCode });
  if (lapNumber) params.append('lap', lapNumber.toString());
  const url = `${API_BASE_URL}/api/telemetry/drs?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch DRS data');
  return await response.json();
}

// Strategy Data
export async function fetchDriverStrategies(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/strategy/drivers?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch driver strategies');
  return await response.json();
}

// Session Drivers
export async function fetchSessionDrivers(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/session/drivers?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch session drivers');
  return await response.json();
}

// Detailed Race Results
export async function fetchDetailedRaceResults(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/results/detailed?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch detailed race results');
  return await response.json();
}

// Stint Analysis
export async function fetchStintAnalysis(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/stint-analysis?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch stint analysis');
  return await response.json();
}

// Tire Strategy
export async function fetchTireStrategy(year: number, event: string, session: string) {
  const params = new URLSearchParams({ year: year.toString(), event, session });
  const url = `${API_BASE_URL}/api/strategy?${params.toString()}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch tire strategy');
  return await response.json();
}

// Sector Comparison
export async function fetchSectorComparison(
  year: number,
  event: string,
  session: string,
  driver1: string,
  driver2: string,
  lap1: string | number = 'fastest',
  lap2: string | number = 'fastest'
) {
  if (!driver1 || !driver2) {
    throw new Error("Both drivers must be specified");
  }

  const params = new URLSearchParams({
    year: year.toString(),
    event,
    session,
    driver1,
    driver2,
    lap1: String(lap1),
    lap2: String(lap2)
  });

  const url = `${API_BASE_URL}/api/comparison/sectors?${params.toString()}`;
  console.log(`Fetching sector comparison from: ${url}`);

  try {
    const response = await fetch(url);
    if (!response.ok) {
      let errorDetail = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (e) { /* Ignore */ }
      console.error(`API Error: ${errorDetail}`);
      throw new Error(errorDetail);
    }
    const data = await response.json();
    console.log(`Successfully fetched sector comparison for ${driver1} (Lap ${lap1}) vs ${driver2} (Lap ${lap2}) in ${year} ${event} ${session}`);
    return data;
  } catch (error) {
    console.error(`Error fetching sector comparison for ${driver1} (Lap ${lap1}) vs ${driver2} (Lap ${lap2}):`, error);

    // For development/demo, return mock data if real API isn't available
    if (process.env.NODE_ENV === 'development') {
      // Generate mock sector comparison data
      const mockData = {
        driver1Code: driver1,
        driver2Code: driver2,
        circuitLayout: "M100,250 C150,100 250,50 400,50 C550,50 650,100 700,250 C750,400 650,450 400,450 C250,450 150,400 100,250 Z",
        sections: [
          {
            id: "s1",
            name: "Turn 1",
            type: "corner",
            path: "M380,50 C420,50 460,50 500,70 C540,90 560,130 560,170",
            driver1Advantage: Math.random() * 0.2 - 0.1
          },
          {
            id: "s2",
            name: "Back Straight",
            type: "straight",
            path: "M560,170 C590,240 620,310 650,380",
            driver1Advantage: Math.random() * 0.2 - 0.1
          },
          {
            id: "s3",
            name: "Chicane",
            type: "corner",
            path: "M650,380 C630,420 580,440 520,440",
            driver1Advantage: Math.random() * 0.2 - 0.1
          },
          {
            id: "s4",
            name: "Final Corner",
            type: "corner",
            path: "M520,440 C400,450 280,430 200,370",
            driver1Advantage: Math.random() * 0.2 - 0.1
          },
          {
            id: "s5",
            name: "Start/Finish",
            type: "straight",
            path: "M200,370 C150,320 120,260 110,200 C100,140 120,90 180,60 C240,30 310,50 380,50",
            driver1Advantage: Math.random() * 0.2 - 0.1
          }
        ]
      };
      return mockData;
    }

    throw error;
  }
}
