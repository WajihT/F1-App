import React from 'react';
import { Image } from 'react-native';

interface WilliamsLogoProps {
  width?: number;
  height?: number;
}

export default function WilliamsLogo({ width = 40, height = 24 }: WilliamsLogoProps) {
  return (
    <Image 
      source={require('../logos/imgi_1_Logo_Williams_F1.png')} 
      style={{ width, height }} 
      resizeMode="contain"
    />
  );
}
