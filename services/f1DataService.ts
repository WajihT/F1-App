// F1 Data Service for fetching data from jolpica-f1 API
export interface Driver {
  position: number;
  name: string;
  team: string;
  points: number;
  wins: number;
	podiums: number;
  driverId?: string;
  nationality?: string;
}

export interface Constructor {
  position: number;
  name: string;
  points: number;
  wins: number;
  constructorId?: string;
  nationality?: string;
}

export interface Race {
  id: number;
  name: string;
  location: string;
  country: string;
  date: string;
  status: 'completed' | 'upcoming' | 'live';
  winner?: string;
  round?: number;
  circuit?: string;
  winnerTeam?: string;

  // Detailed result fields
  position?: number | null;
  driverCode?: string;
  fullName?: string;
  team?: string;
  points?: number;
  resultStatus?: string; // renamed to avoid clash with 'status'
  gridPosition?: number | null;
  teamColor?: string;
  isFastestLap?: boolean;
  fastestLapTime?: string | null;
  lapsCompleted?: number | null;
  q1Time?: string | null;
  q2Time?: string | null;
  q3Time?: string | null;
  poleLapTimeValue?: string | null;
  fastestLapTimeValue?: string | null;
}

export interface RaceResults {
  id: number;
  name: string;
  location: string;
  country: string;
  date: string;
  status: 'completed' | 'upcoming' | 'live';
  winner?: string;
  round?: number;
  circuit?: string;
  winnerTeam?: string;

  // Detailed result fields
  position?: number | null;
  driverCode?: string;
  fullName?: string;
  team?: string;
  points?: number;
  resultStatus?: string; // renamed to avoid clash with 'status'
  gridPosition?: number | null;
  teamColor?: string;
  isFastestLap?: boolean;
  fastestLapTime?: string | null;
  lapsCompleted?: number | null;
  q1Time?: string | null;
  q2Time?: string | null;
  q3Time?: string | null;
  poleLapTimeValue?: string | null;
  fastestLapTimeValue?: string | null;
}

export interface Season {
  year: number;
  label: string;
}

import {
  fetchDriverStandings,
  fetchConstructorStandings,
  fetchRaceResults,
  fetchSchedule,
  fetchAvailableSessions,
  fetchRace
} from '../lib/api';

// Available seasons from 1950 to current year
export const getAvailableSeasons = (): Season[] => {
  const currentYear = new Date().getFullYear();
  const seasons: Season[] = [];
  
  for (let year = currentYear; year >= 1950; year--) {
    seasons.push({
      year,
      label: `${year} Season`
    });
  }
  
  return seasons;
};

// Base URL for jolpica-f1 API
//const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

export class F1DataService {
  private static instance: F1DataService;
  
  public static getInstance(): F1DataService {
    if (!F1DataService.instance) {
      F1DataService.instance = new F1DataService();
    }
    return F1DataService.instance;
  }

	async countPodiumsForDriver(season: number, driverId: string): Promise<number> {
  try {
    const response = await fetch(`/${season}/results.json?limit=1000`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const races = data.MRData?.RaceTable?.Races || [];

    let podiums = 0;

    for (const race of races) {
      const result = race.Results.find((r: any) => r.Driver.driverId === driverId);
      if (result && ['1', '2', '3'].includes(result.position)) {
        podiums++;
      }
    }

    return podiums;
  } catch (error) {
    console.error(`Error counting podiums for ${driverId}:`, error);
    return 0;
  }
}

delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

  async fetchDriverStandings(season: number): Promise<Driver[]> {
    try {
      const drivers = await fetchDriverStandings(season);
      //console.log(drivers);
      return drivers.map((driver: any, idx: number) => ({
        position: driver.position ?? idx + 1, // <-- Use nullish coalescing to handle undefined
        name: `${driver.name}`,
        team: driver.team,
        points: driver.points,
        wins: driver.wins,
        podiums: driver.podiums,
        driverId: driver.driverId,
        nationality: driver.nationality,
      }));
    } catch (error) {
      console.error('Error fetching driver standings:', error);
      return this.getFallbackDriverStandings();
    }
  }

async fetchConstructorStandings(season: number): Promise<Constructor[]> {
  try {
    const teams = await fetchConstructorStandings(season);
    return teams.map((team: any, idx: number) => ({
      position: team.position ?? idx + 1,
      name: `${team.team}`,
      points: team.points,
      wins: team.wins,
      constructorId: team.constructorId,
      nationality: team.nationality,
    }));
  } catch (error) {
    console.error('Error fetching constructor standings:', error);
    return this.getFallbackConstructorStandings();
  }
}

async fetchRaceCalendar(season: number): Promise<Race[]> {
  try {
    const scheduleEvents = await fetchSchedule(season); // This returns ScheduleEvent[]
    //console.log(scheduleEvents);
    const now = new Date();
    const races: Race[] = scheduleEvents.map((event: any, idx: number) => {
      const eventDate = new Date(event.EventDate);
      let status: 'completed' | 'upcoming' | 'live';
      if (eventDate < now) {
        status = 'completed';
      } else if (eventDate == now) {
        status = 'live';
      } else {
        status = 'upcoming';
      }
      // Optionally, add logic for 'live' if you have session times
      return {
        id: event.RoundNumber ?? idx + 1,
        name: event.EventName,
        location: event.Location,
        country: event.Country,
        date: event.EventDate,
        status,
        round: event.RoundNumber,
        circuit: event.Location,
      };
    });
    return races;
  } catch (error) {
    console.error('Error fetching race calendar:', error);
    return this.getFallbackRaceCalendar();
  }
}

async fetchSeasonRaces(season: number): Promise<Race[]> {
  try {
    const results = await fetchRace(season);
    //console.log("RAW API results:", results);
    return results.map((result: any, idx: number) => ({
      id: result.round ?? idx + 1,
      name: result.event,
      location: undefined, // Not provided by API
      country: undefined,  // Not provided by API
      date: undefined,     // Not provided by API
      status: 'completed', // Or use your own logic if available
      winner: result.driver,
      winnerTeam: result.team,
      round: result.round,
      circuit: undefined,  // Not provided by API
      teamColor: result.teamColor,
      year: result.year,
    }));
  } catch (error) {
    console.error('Error fetching season races:', error);
    return [];
  }
}


async fetchRaceResults(season: number, event: string, session: string): Promise<Race[]> {
  try {
    const results = await fetchRaceResults(season, event, session);
    //console.log("fetch race results in dataservice:",results);

    return results.map((result: any, idx: number) => ({
      id: result.round ?? idx + 1,
      name: result.event,
      round: result.round,
      country: result.country,
      location: result.location,
      date: result.date,
      status: 'completed', // You can dynamically set this if needed
      driverCode: result.driverCode,
      fullName: result.fullName,
      team: result.team,
      teamColor: result.teamColor,
      points: result.points,
      resultStatus: result.status,
      gridPosition: result.gridPosition,
      isFastestLap: result.isFastestLap,
      fastestLapTimeValue: result.fastestLapTimeValue,
      poleLapTimeValue: result.poleLapTimeValue,
    }));
  } catch (error) {
    console.error('Error fetching detailed race results:', error);
    return this.getFallbackRaceResults();
  }
}

  // Fallback data for when API is unavailable
  private getFallbackDriverStandings(): Driver[] {
    return [
      { position: 1, name: 'Max Verstappen', team: 'Red Bull Racing', wins: 19, podiums:  21, points: 575},
      { position: 2, name: 'Sergio Perez', team: 'Red Bull Racing', wins: 2, podiums: 9, points: 285 },
      { position: 3, name: 'Lewis Hamilton', team: 'Mercedes', wins: 1, podiums: 6, points: 234 },
      { position: 4, name: 'Fernando Alonso', team: 'Aston Martin', wins: 0, podiums: 8, points: 206 },
      { position: 5, name: 'Charles Leclerc', team: 'Ferrari', wins: 1, podiums: 7, points: 206 },
    ];
  }

  private getFallbackConstructorStandings(): Constructor[] {
    return [
      { position: 1, name: 'Red Bull Racing', points: 860, wins: 21 },
      { position: 2, name: 'Mercedes', points: 409, wins: 1 },
      { position: 3, name: 'Ferrari', points: 406, wins: 2 },
      { position: 4, name: 'Aston Martin', points: 280, wins: 0 },
      { position: 5, name: 'McLaren', points: 212, wins: 0 },
    ];
  }

  private getFallbackRaceCalendar(): Race[] {
    return [
      {
        id: 1,
        name: 'Bahrain Grand Prix',
        location: 'Bahrain International Circuit',
        country: 'Bahrain',
        date: 'March 5, 2024',
        status: 'completed',
      },
      {
        id: 2,
        name: 'Abu Dhabi Grand Prix',
        location: 'Yas Marina Circuit',
        country: 'United Arab Emirates',
        date: 'December 8, 2024',
        status: 'upcoming',
      },
    ];
  }

  private getFallbackRaceResults(): any[] {
    return [
      { year: 2024, event: 'Bahrain Grand Prix', round: 1, driver: 'Max Verstappen', team: 'Red Bull Racing', teamColor: '#1E41FF' },
      { year: 2024, event: 'Abu Dhabi Grand Prix', round: 2, driver: 'Lewis Hamilton', team: 'Mercedes', teamColor: '#00D2BE' },
    ];
  }
}