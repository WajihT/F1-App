import React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { VictoryChart, VictoryLine, VictoryAxis, VictoryLegend } from 'victory-native';

export default function PositionsTabContentMobile() {
  // Dummy driver codes and data
  const driverCodes = ['HAM', 'VER', 'LEC'];
  const chartLines = [
    {
      code: 'HAM',
      data: [
        { x: 1, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
        { x: 4, y: 2 },
      ],
    },
    {
      code: 'VER',
      data: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 2 },
        { x: 4, y: 1 },
      ],
    },
    {
      code: 'LEC',
      data: [
        { x: 1, y: 3 },
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 4, y: 3 },
      ],
    },
  ];

  return (
    <ScrollView style={styles.card}>
      <Text style={styles.title}>Lap-by-Lap Position Changes (Dummy Data)</Text>
      <VictoryChart
        height={350}
        padding={{ left: 40, right: 20, top: 20, bottom: 40 }}
        domainPadding={{ y: 10 }}
      >
        <VictoryAxis
          label="Lap"
          style={{
            axisLabel: { padding: 30, fill: '#9ca3af' },
            tickLabels: { fill: '#9ca3af', fontSize: 10 },
          }}
        />
        <VictoryAxis
          dependentAxis
          label="Position"
          domain={[3, 1]}
          style={{
            axisLabel: { padding: 35, fill: '#9ca3af' },
            tickLabels: { fill: '#9ca3af', fontSize: 10 },
          }}
        />
        {chartLines.map(line => (
          <VictoryLine
            key={line.code}
            data={line.data}
            style={{
              data: { stroke: '#ef4444', strokeWidth: 2 },
            }}
          />
        ))}
        <VictoryLegend
          x={50}
          y={10}
          orientation="horizontal"
          gutter={20}
          data={driverCodes.map(code => ({
            name: code,
            symbol: { fill: '#ef4444' },
          }))}
        />
      </VictoryChart>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#18181b',
    borderRadius: 16,
    padding: 16,
    margin: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 8,
  },
});