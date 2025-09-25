import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  message?: string;
  fullScreen?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = '#FF6F00',
  message,
  fullScreen = false,
  className = ''
}) => {
  const containerClass = fullScreen 
    ? 'flex-1 items-center justify-center bg-background'
    : 'items-center justify-center p-4';

  return (
    <View className={`${containerClass} ${className}`}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="text-text-secondary mt-4 text-center">
          {message}
        </Text>
      )}
    </View>
  );
};