import React from 'react';
import { 
  Ionicons, 
  MaterialIcons, 
  FontAwesome, 
  Feather, 
  AntDesign,
  MaterialCommunityIcons 
} from '@expo/vector-icons';
import { IconProps } from './Icon.types';

const IconFamilies = {
  Ionicons,
  MaterialIcons,
  FontAwesome,
  Feather,
  AntDesign,
  MaterialCommunityIcons
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#2D3142',
  family = 'Ionicons',
  className,
  ...props
}) => {
  const IconComponent = IconFamilies[family];
  
  if (!IconComponent) {
    console.warn(`Icon family "${family}" is not supported`);
    return null;
  }

  return (
    <IconComponent
      name={name as any}
      size={size}
      color={color}
      {...props}
    />
  );
};