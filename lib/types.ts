// Lap Time Data Interface
export interface LapTimeDataPoint {
    LapNumber: number;
    [driverCode: string]: number | null; // Allow null for missed laps
}

// Telemetry Data Interfaces
export interface SpeedDataPoint { 
    Distance: number; 
    Speed: number; 
}

export interface GearMapDataPoint { 
    X: number; 
    Y: number; 
    nGear: number; 
}

export interface ThrottleDataPoint { 
    Distance: number; 
    Throttle: number; 
}

export interface BrakeDataPoint { 
    Distance: number; 
    Brake: number; 
}

export interface RPMDataPoint { 
    Distance: number; 
    RPM: number; 
}

export interface DRSDataPoint { 
    Distance: number; 
    DRS: number; 
}

// Strategy Interfaces
export interface TireStint { 
    compound: string; 
    startLap: number; 
    endLap: number; 
    lapCount: number; 
}

export interface DriverStrategy { 
    driver: string; 
    stints: TireStint[]; 
}

// Driver and Team Interfaces
export interface SessionDriver { 
    code: string; 
    name: string; 
    team: string; 
}

export interface DriverStanding { 
    rank: number; 
    code: string; 
    name: string; 
    team: string; 
    points: number; 
    wins: number; 
    podiums: number; 
    points_change?: number; 
    teamColor?: string; 
}

export interface TeamStanding { 
    rank: number; 
    team: string; 
    points: number; 
    wins: number; 
    podiums: number; 
    points_change?: number; 
    teamColor?: string; 
    shortName?: string; 
}

// Race Result Interfaces
export interface RaceResult { 
    year: number; 
    event: string; 
    round: number; 
    driver: string; 
    team: string; 
    teamColor: string; 
    date?: string; 
    location?: string; 
}

export interface DetailedRaceResult {
    position: number | null;
    driverCode: string;
    fullName: string;
    team: string;
    points: number;
    status: string;
    gridPosition?: number | null; // Optional for non-race/sprint
    teamColor: string;
    isFastestLap?: boolean; // Optional, mainly for Race/Sprint
    // Fields for specific session types
    fastestLapTime?: string | null; // For Practice
    lapsCompleted?: number | null; // For Practice
    q1Time?: string | null; // For Qualifying
    q2Time?: string | null; // For Qualifying
    q3Time?: string | null; // For Qualifying
    // Added fields for specific lap times from processor
    poleLapTimeValue?: string | null; // Formatted pole time (MM:SS.ms)
    fastestLapTimeValue?: string | null; // Formatted fastest lap time (MM:SS.ms)
}

// Position Data Interface
export interface LapPositionDataPoint {
    LapNumber: number;
    [driverCode: string]: number | null; // Position for each driver, null if DNF/not available
}

// Session Interface
export interface AvailableSession {
    name: string;
    type: string;
    startTime: string; // Note: This might not be directly available from the schedule endpoint
}

// Stint Analysis Interfaces
export interface LapDetail {
    lapNumber: number;
    lapTime: number; // Lap time in seconds
}

export interface StintAnalysisData {
    driverCode: string;
    stintNumber: number;
    compound: string;
    startLap: number;
    endLap: number;
    lapDetails: LapDetail[]; // Array of {lapNumber, lapTime} objects
}
