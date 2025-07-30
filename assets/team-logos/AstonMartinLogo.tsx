import React from 'react';
import { Image } from 'react-native';

interface AstonMartinLogoProps {
  width?: number;
  height?: number;
}

export default function AstonMartinLogo({ width = 36, height = 32 }: AstonMartinLogoProps) {
  return (
    <Image 
      source={require('../logos/astonmartin.png')}
      style={{ width, height }}
      resizeMode="contain"
    />
  );
}
