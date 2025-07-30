import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { commonStyles } from '../styles/commonStyles';
import CircuitComparisonChart from './CircuitComparisonChart';
import DRSChart from './DRSChart';
import RPMChart from './RPMChart';
import ThrottleChart from './ThrottleChart';
import BrakeChart from './BrakeChart';

interface TelemetryDashboardProps {
  year: number;
  event: string;
  session: string;
}

const TelemetryDashboard: React.FC<TelemetryDashboardProps> = ({
  year,
  event,
  session,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'detail'>('overview');

  const renderTabSelector = () => (
    <View
      style={{
        backgroundColor: '#101624',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#384151',
        padding: 4,
        marginVertical: 8,
        marginHorizontal: 6,
        marginBottom: 18,
        flexDirection: 'row',
      }}
    >
      <TouchableOpacity
        onPress={() => setActiveTab('overview')}
        style={{
          backgroundColor: activeTab === 'overview' ? '#dc2626' : '#141422',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flex: 1,
          margin: 1,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          Overview
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={() => setActiveTab('detail')}
        style={{
          backgroundColor: activeTab === 'detail' ? '#dc2626' : '#141422',
          borderRadius: 8,
          paddingVertical: 12,
          paddingHorizontal: 16,
          flex: 1,
          margin: 1,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
          Detail
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderOverviewTab = () => (
    <View style={{ paddingBottom: 20 }}>
      <CircuitComparisonChart
        year={year}
        event={event}
        session={session}
      />
    </View>
  );

  const renderDetailTab = () => (
    <View style={{ paddingBottom: 20, paddingHorizontal: 16 }}>
      {/* Vertical stack layout for the 4 telemetry charts */}
      <View style={{ gap: 24 }}>
        {/* Throttle Chart */}
        <View>
          <ThrottleChart
            year={year}
            event={event}
            session={session}
          />
        </View>

        {/* Brake Chart */}
        <View>
          <BrakeChart
            year={year}
            event={event}
            session={session}
          />
        </View>

        {/* RPM Chart */}
        <View>
          <RPMChart
            year={year}
            event={event}
            session={session}
          />
        </View>

        {/* DRS Chart */}
        <View>
          <DRSChart
            year={year}
            event={event}
            session={session}
          />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <Text style={[commonStyles.title, { 
        marginBottom: 16, 
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold'
      }]}>
        Circuit Analysis
      </Text>
      
      {renderTabSelector()}
      
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {activeTab === 'overview' ? renderOverviewTab() : renderDetailTab()}
      </ScrollView>
    </View>
  );
};

export default TelemetryDashboard;
