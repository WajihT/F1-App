import React from 'react';

interface RaceResult {
  position: number;
  driverCode: string;
  fullName: string;
  team: string;
  teamColor: string;
  resultStatus: string;
  points: number;
  gridPosition: number;
}

interface ResultsTableProps {
  results: RaceResult[];
}

const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => (
  <table className="results-table">
    <thead>
      <tr>
        <th>Pos</th>
        <th>Driver</th>
        <th>Grid</th>
        <th>Status</th>
        <th>Points</th>
      </tr>
    </thead>
    <tbody>
      {results.map((r) => (
        <tr key={r.driverCode}>
          <td>{r.position}</td>
          <td>{r.fullName}</td>
          <td>{r.gridPosition}</td>
          <td>{r.resultStatus}</td>
          <td>{r.points}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default ResultsTable;