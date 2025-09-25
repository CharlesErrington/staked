import React from 'react';
import { TextInput, View, Text } from 'react-native';
import { InputProps } from './Input.types';

export const Input: React.FC<InputProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  error,
  label,
  helperText,
  size = 'md',
  variant = 'default',
  keyboardType = 'default',
  autoCapitalize = 'none',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const variantClasses = {
    default: 'bg-gray-50 border',
    filled: 'bg-gray-100 border-0',
    outlined: 'bg-transparent border-2'
  };
  
  const errorClasses = error ? 'border-error' : 'border-gray-200';
  
  return (
    <View className="mb-4">
      {label && (
        <Text className="text-text-primary font-medium mb-2">
          {label}
        </Text>
      )}
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        className={`rounded-2xl ${variantClasses[variant]} ${sizeClasses[size]} ${errorClasses} text-text-primary ${className}`}
        placeholderTextColor="#9CA3AF"
        {...props}
      />
      {helperText && !error && (
        <Text className="text-gray-500 text-sm mt-1 ml-2">
          {helperText}
        </Text>
      )}
      {error && (
        <Text className="text-error text-sm mt-1 ml-2">
          {error}
        </Text>
      )}
    </View>
  );
};