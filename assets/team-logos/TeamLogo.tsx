import React from 'react';
import { SvgProps } from 'react-native-svg';

// Direct SVG imports
import FerrariSvg from '../logos/Ferrari.svg';
import MercedesSvg from '../logos/Mercedes.svg';
import RedBullSvg from '../logos/RedBull.svg';
import McLarenSvg from '../logos/McLaren.svg';
import AlpineSvg from '../logos/Alpine.svg';
import AstonMartinSvg from '../logos/AstonMartin.svg';
import WilliamsSvg from '../logos/Williams.svg';
import HaasSvg from '../logos/Haas.svg';
import RacingBullsSvg from '../logos/RacingBulls.svg';
import AlfaRomeoSvg from '../logos/AlfaRomeo.svg';

interface TeamLogoProps extends SvgProps {
  team: string;
  width?: number;
  height?: number;
}

const teamLogos: Record<string, React.FC<SvgProps>> = {
  Ferrari: FerrariSvg,
  Mercedes: MercedesSvg,
  'Red Bull Racing': RedBullSvg,
  'Red Bull': RedBullSvg,
  McLaren: McLarenSvg,
  Alpine: AlpineSvg,
  'Aston Martin': AstonMartinSvg,
  Williams: WilliamsSvg,
  Haas: HaasSvg,
  'RB F1 Team': RacingBullsSvg,
  'Racing Bulls': RacingBullsSvg,
  'Kick Sauber': AlfaRomeoSvg,
};

export default function TeamLogo({ team, width = 24, height = 24, ...props }: TeamLogoProps) {
  const LogoComponent = teamLogos[team];
  
  if (!LogoComponent) {
    // Fallback for unknown teams
    return null;
  }

  return <LogoComponent width={width} height={height} {...props} />;
}
