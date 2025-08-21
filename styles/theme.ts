export const theme = {
  colors: {
    primary: {
      main: '#ff1801',
      light: '#ff4433',
      dark: '#cc1401',
      gradient: ['#ff1801', '#ff4433', '#cc1401'],
    },
    
    background: {
      primary: ['#0a0a0f', '#050508', '#0c0612', '#0a0a0f'],
      secondary: ['#13131a', '#0a0a0f', '#1a1a22'],
      card: 'rgba(242, 6, 6, 0.03)',
      cardHover: 'rgba(255, 255, 255, 0.05)',
      glass: 'rgba(255, 255, 255, 0.02)',
    },
    
    text: {
      primary: '#ffffff',
      secondary: 'rgba(255, 255, 255, 0.7)',
      tertiary: 'rgba(255, 255, 255, 0.5)',
      accent: '#ff1801',
    },
    
    ui: {
      border: 'rgba(255, 255, 255, 0.1)',
      borderHover: 'rgba(255, 255, 255, 0.2)',
      divider: 'rgba(255, 255, 255, 0.05)',
      shadow: 'rgba(0, 0, 0, 0.5)',
      glow: 'rgba(255, 24, 1, 0.3)',
    },
    
    status: {
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff3366',
      info: '#00aaff',
    },
    
    teams: {
      mercedes: '#00d2be',
      redBull: '#0600ef',
      ferrari: '#dc0000',
      mclaren: '#ff8700',
      astonMartin: '#006f62',
      alpine: '#0090ff',
      williams: '#005aff',
      haas: '#ffffff',
      rb: '#6692ff',
      kickSauber: '#52e252',
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 999,
  },
  
  typography: {
    fontFamily: {
    regular: 'JetBrainsMono-Regular',
    medium: 'JetBrainsMono-Medium',
    semiBold: 'JetBrainsMono-SemiBold',
    bold: 'JetBrainsMono-Bold',
    extraBold: 'JetBrainsMono-ExtraBold',
  },
    fontSize: {
      xs: 10,
      sm: 12,
      md: 14,
      title: 20,
      lg: 28,
      xl: 22,
      xxl: 30,
      xxxl: 46,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    glow: {
      shadowColor: '#ff1801',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 0,
    },
  },
  
  animation: {
    timing: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      in: 'ease-in',
      out: 'ease-out',
      inOut: 'ease-in-out',
    },
  },
};