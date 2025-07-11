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
}

export interface Season {
  year: number;
  label: string;
}

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
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

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
    const response = await fetch(`${BASE_URL}/${season}/results.json?limit=1000`);
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
    console.log(`Fetching driver standings for season ${season}`);
    const response = await fetch(`${BASE_URL}/${season}/driverStandings.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const standings = data.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings || [];

    const drivers: Driver[] = [];

    for (const [index, standing] of standings.entries()) {
      const driverId = standing.Driver?.driverId;
      const podiums = await this.countPodiumsForDriver(season, driverId); // sequential
      //await this.delay(1000); // 1 second delay to avoid rate limit

      drivers.push({
        position: parseInt(standing.position) || index + 1,
        name: `${standing.Driver?.givenName || ''} ${standing.Driver?.familyName || ''}`.trim(),
        team: standing.Constructors?.[0]?.name || 'Unknown Team',
        points: parseInt(standing.points) || 0,
        wins: parseInt(standing.wins) || 0,
        podiums,
        driverId,
        nationality: standing.Driver?.nationality
      });
    }

    return drivers;
  } catch (error) {
    console.error('Error fetching driver standings:', error);
    return this.getFallbackDriverStandings();
  }
}

  async fetchConstructorStandings(season: number): Promise<Constructor[]> {
    try {
      console.log(`Fetching constructor standings for season ${season}`);
      const response = await fetch(`${BASE_URL}/${season}/constructorStandings.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const standings = data.MRData?.StandingsTable?.StandingsLists?.[0]?.ConstructorStandings || [];
      
      return standings.map((standing: any, index: number) => ({
        position: parseInt(standing.position) || index + 1,
        name: standing.Constructor?.name || 'Unknown Constructor',
        points: parseInt(standing.points) || 0,
        wins: parseInt(standing.wins) || 0,
        constructorId: standing.Constructor?.constructorId,
        nationality: standing.Constructor?.nationality
      }));
    } catch (error) {
      console.error('Error fetching constructor standings:', error);
      return this.getFallbackConstructorStandings();
    }
  }

  async fetchRaceCalendar(season: number): Promise<Race[]> {
    try {
      console.log(`Fetching race calendar for season ${season}`);
      const response = await fetch(`${BASE_URL}/${season}.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const races = data.MRData?.RaceTable?.Races || [];
      
      return races.map((race: any, index: number) => {
        const raceDate = new Date(race.date);
        const now = new Date();
        const status = raceDate < now ? 'completed' : 'upcoming';
        
        return {
          id: index + 1,
          name: race.raceName || 'Unknown Race',
          location: race.Circuit?.circuitName || 'Unknown Circuit',
          country: race.Circuit?.Location?.country || 'Unknown Country',
          date: race.date || '',
          status,
          round: parseInt(race.round) || index + 1,
          circuit: race.Circuit?.circuitId
        };
      });
    } catch (error) {
      console.error('Error fetching race calendar:', error);
      return this.getFallbackRaceCalendar();
    }
  }

  async fetchRaceResults(season: number, round: number): Promise<any> {
    try {
      console.log(`Fetching race results for season ${season}, round ${round}`);
      const response = await fetch(`${BASE_URL}/${season}/${round}/results.json`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const results = data.MRData?.RaceTable?.Races?.[0]?.Results || [];
      
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error fetching race results:', error);
      return null;
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
}