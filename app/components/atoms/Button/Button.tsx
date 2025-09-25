import React from 'react';
import { Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ButtonProps } from './Button.types';

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  onPress, 
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-8 py-4',
    lg: 'px-12 py-5'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };
  
  const variantClasses = {
    primary: 'bg-orange-500',
    secondary: 'bg-calm-blue-500',
    ghost: 'border border-gray-300 bg-transparent',
    danger: 'bg-error',
    success: 'bg-success',
  };

  const baseClasses = 'rounded-full flex-row items-center justify-center';
  const disabledClasses = disabled || loading ? 'opacity-50' : '';
  const widthClasses = fullWidth ? 'w-full' : '';
  const textColor = variant === 'ghost' ? 'text-text-primary' : 'text-white';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${widthClasses} ${className}`}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? '#2D3142' : '#FFFFFF'} />
      ) : (
        <Text className={`${textColor} font-semibold ${textSizeClasses[size]}`}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
};