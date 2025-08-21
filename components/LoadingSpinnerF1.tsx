import React from 'react';
import { Animated } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface LoadingSpinnerF1Props {
  size?: number;
  color?: string;
}

// Custom F1 Loading Spinner Component
const LoadingSpinnerF1: React.FC<LoadingSpinnerF1Props> = ({ size = 48, color = "#ef4444" }) => {
  const spinValue = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    const spin = () => {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    };
    spin();
  }, [spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={{ transform: [{ rotate }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {/* Outer circle */}
        <Circle 
          cx="12" 
          cy="12" 
          r="10" 
          stroke={color} 
          strokeWidth="1.5" 
          fill="none" 
          opacity="1" 
        />
        {/* Wheel spokes */}
        <Line x1="12" y1="2" x2="12" y2="6" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="12" y1="18" x2="12" y2="22" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="4.93" y1="4.93" x2="7.76" y2="7.76" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="16.24" y1="16.24" x2="19.07" y2="19.07" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="2" y1="12" x2="6" y2="12" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="18" y1="12" x2="22" y2="12" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="4.93" y1="19.07" x2="7.76" y2="16.24" stroke={color} strokeWidth="2" opacity="1" />
        <Line x1="16.24" y1="7.76" x2="19.07" y2="4.93" stroke={color} strokeWidth="2" opacity="1" />
      </Svg>
    </Animated.View>
  );
};

export default LoadingSpinnerF1;
