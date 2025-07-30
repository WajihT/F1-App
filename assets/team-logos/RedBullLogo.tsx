import React from 'react';
import { Image } from 'react-native';

interface RedBullLogoProps {
  width?: number;
  height?: number;
}

export default function RedBullLogo({ width = 40, height = 24 }: RedBullLogoProps) {
  return (
    <Image 
          source={require('../logos/rb.png')} 
          style={{ width, height }} 
          resizeMode="contain"
        />
  );
}
