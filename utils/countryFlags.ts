// Country to flag image URL mapping for F1 Grand Prix locations
export const countryFlags: { [key: string]: string } = {
  // Current F1 countries
  'Australia': 'https://flagcdn.com/w80/au.png',
  'Austria': 'https://flagcdn.com/w80/at.png',
  'Azerbaijan': 'https://flagcdn.com/w80/az.png',
  'Bahrain': 'https://flagcdn.com/w80/bh.png',
  'Belgium': 'https://flagcdn.com/w80/be.png',
  'Brazil': 'https://flagcdn.com/w80/br.png',
  'Canada': 'https://flagcdn.com/w80/ca.png',
  'China': 'https://flagcdn.com/w80/cn.png',
  'France': 'https://flagcdn.com/w80/fr.png',
  'Germany': 'https://flagcdn.com/w80/de.png',
  'Hungary': 'https://flagcdn.com/w80/hu.png',
  'Italy': 'https://flagcdn.com/w80/it.png',
  'Japan': 'https://flagcdn.com/w80/jp.png',
  'Mexico': 'https://flagcdn.com/w80/mx.png',
  'Monaco': 'https://flagcdn.com/w80/mc.png',
  'Netherlands': 'https://flagcdn.com/w80/nl.png',
  'Qatar': 'https://flagcdn.com/w80/qa.png',
  'Saudi Arabia': 'https://flagcdn.com/w80/sa.png',
  'Singapore': 'https://flagcdn.com/w80/sg.png',
  'Spain': 'https://flagcdn.com/w80/es.png',
  'Thailand': 'https://flagcdn.com/w80/th.png',
  'Turkey': 'https://flagcdn.com/w80/tr.png',
  'UK': 'https://flagcdn.com/w80/gb.png',
  'United States': 'https://flagcdn.com/w80/us.png',
  'UAE': 'https://flagcdn.com/w80/ae.png',
  'United Arab Emirates': 'https://flagcdn.com/w80/ae.png',
  'Las Vegas': 'https://flagcdn.com/w80/us.png', // Las Vegas GP is in USA
  'Miami': 'https://flagcdn.com/w80/us.png', // Miami GP is in USA
  
  // Historical F1 countries
  'Argentina': 'https://flagcdn.com/w80/ar.png',
  'South Africa': 'https://flagcdn.com/w80/za.png',
  'Portugal': 'https://flagcdn.com/w80/pt.png',
  'San Marino': 'https://flagcdn.com/w80/sm.png',
  'Luxembourg': 'https://flagcdn.com/w80/lu.png',
  'Switzerland': 'https://flagcdn.com/w80/ch.png',
  'Sweden': 'https://flagcdn.com/w80/se.png',
  'Morocco': 'https://flagcdn.com/w80/ma.png',
  'India': 'https://flagcdn.com/w80/in.png',
  'Korea': 'https://flagcdn.com/w80/kr.png',
  'South Korea': 'https://flagcdn.com/w80/kr.png',
  'Malaysia': 'https://flagcdn.com/w80/my.png',
  'Russia': 'https://flagcdn.com/w80/ru.png',
  'Europe': 'https://flagcdn.com/w80/eu.png', // European Union flag for European GP
  'Pacific': 'https://flagcdn.com/w80/jp.png', // Pacific GP was in Japan
  'Detroit': 'https://flagcdn.com/w80/us.png', // Detroit GP was in USA
  'Dallas': 'https://flagcdn.com/w80/us.png', // Dallas GP was in USA
  'Phoenix': 'https://flagcdn.com/w80/us.png', // Phoenix GP was in USA
  'Indianapolis': 'https://flagcdn.com/w80/us.png', // Indianapolis GP was in USA
  'Watkins Glen': 'https://flagcdn.com/w80/us.png', // Watkins Glen GP was in USA
  'Long Beach': 'https://flagcdn.com/w80/us.png', // Long Beach GP was in USA
  'Caesar\'s Palace': 'https://flagcdn.com/w80/us.png', // Caesar's Palace GP was in USA
  'Caesars Palace': 'https://flagcdn.com/w80/us.png', // Alternative spelling
};

export const getCountryFlag = (country: string): string => {
  console.log(`Getting flag for country: ${country}`);
  
  // Handle special cases and normalize country names
  const normalizedCountry = country.trim();
  
  // Direct lookup
  if (countryFlags[normalizedCountry]) {
    console.log(`Found direct match for ${normalizedCountry}`);
    return countryFlags[normalizedCountry];
  }
  
  // Try to find partial matches for complex race names
  const countryKeys = Object.keys(countryFlags);
  for (const key of countryKeys) {
    if (normalizedCountry.toLowerCase().includes(key.toLowerCase()) || 
        key.toLowerCase().includes(normalizedCountry.toLowerCase())) {
      console.log(`Found partial match: ${key} for ${normalizedCountry}`);
      return countryFlags[key];
    }
  }
  
  // Special handling for common variations
  if (normalizedCountry.toLowerCase().includes('britain') || 
      normalizedCountry.toLowerCase().includes('england')) {
    console.log(`Matched Britain/England to UK for ${normalizedCountry}`);
    return 'https://flagcdn.com/w80/gb.png';
  }
  
  if (normalizedCountry.toLowerCase().includes('america') || 
      normalizedCountry.toLowerCase().includes('usa')) {
    console.log(`Matched America/USA to US for ${normalizedCountry}`);
    return 'https://flagcdn.com/w80/us.png';
  }
  
  // Default flag for unknown countries - using a generic racing flag
  console.log(`No match found for ${normalizedCountry}, using default flag`);
  return 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=80&h=60&fit=crop&crop=center';
};