import React from 'react';
import { Image } from 'react-native';

interface McLarenLogoProps {
  width?: number;
  height?: number;
}

export default function McLarenLogo({ width = 40, height = 35 }: McLarenLogoProps) {
  return (
    <Image 
      source={require('../logos/mc_laren.png')} 
      style={{ width, height }} 
      resizeMode="contain"
    />
  );
}
