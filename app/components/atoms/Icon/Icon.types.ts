import { TextProps } from 'react-native';

export interface IconProps extends Omit<TextProps, 'children'> {
  name: string;
  size?: number;
  color?: string;
  family?: 'Ionicons' | 'MaterialIcons' | 'FontAwesome' | 'Feather' | 'AntDesign' | 'MaterialCommunityIcons';
  className?: string;
}

export type IconFamily = IconProps['family'];