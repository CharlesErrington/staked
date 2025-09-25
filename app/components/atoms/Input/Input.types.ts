import { TextInputProps } from 'react-native';

export interface InputProps extends Omit<TextInputProps, 'className'> {
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  className?: string;
}

export type InputSize = InputProps['size'];
export type InputVariant = InputProps['variant'];