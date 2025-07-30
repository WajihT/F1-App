import React from 'react';
import { Image } from 'react-native';

interface HaasLogoProps {
  width?: number;
  height?: number;
}

export default function HaasLogo({ width = 40, height = 24 }: HaasLogoProps) {
  return (
    <Image 
      source={require('../logos/haas.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
