import React from 'react';
import { View, Text } from 'react-native';
import { Icon } from '../Icon';
import { Button } from '../Button';

interface ErrorProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  variant?: 'error' | 'warning' | 'info';
  className?: string;
}

export const Error: React.FC<ErrorProps> = ({
  title = 'Oops!',
  message,
  onRetry,
  fullScreen = false,
  variant = 'error',
  className = ''
}) => {
  const containerClass = fullScreen 
    ? 'flex-1 items-center justify-center bg-background px-6'
    : 'items-center justify-center p-4';

  const iconColors = {
    error: '#FF9B71',
    warning: '#FFB86C',
    info: '#8194FC'
  };

  const iconNames = {
    error: 'alert-circle',
    warning: 'alert-triangle',
    info: 'information-circle'
  };

  return (
    <View className={`${containerClass} ${className}`}>
      <Icon
        family="Ionicons"
        name={iconNames[variant]}
        size={48}
        color={iconColors[variant]}
      />
      
      <Text className="text-xl font-semibold text-text-primary mt-4 mb-2">
        {title}
      </Text>
      
      <Text className="text-text-secondary text-center mb-6">
        {message}
      </Text>
      
      {onRetry && (
        <Button
          variant="primary"
          size="sm"
          onPress={onRetry}
        >
          Try Again
        </Button>
      )}
    </View>
  );
};