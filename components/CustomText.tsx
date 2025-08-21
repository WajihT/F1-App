import React from 'react';
import { Text, TextProps, TextStyle } from 'react-native';
import { typography } from '../styles/commonStyles';

interface CustomTextProps extends TextProps {
  fontWeight?: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
}

const CustomText: React.FC<CustomTextProps> = ({ 
  style, 
  fontWeight = 'regular', 
  children, 
  ...props 
}) => {
  const getFontFamily = (weight: string) => {
    switch (weight) {
      case 'medium':
        return typography.fontFamily.medium;
      case 'semiBold':
        return typography.fontFamily.semiBold;
      case 'bold':
        return typography.fontFamily.bold;
      case 'extraBold':
        return typography.fontFamily.extraBold;
      default:
        return typography.fontFamily.regular;
    }
  };

  const defaultStyle: TextStyle = {
    fontFamily: getFontFamily(fontWeight),
  };

  return (
    <Text style={[defaultStyle, style]} {...props}>
      {children}
    </Text>
  );
};

export default CustomText;
