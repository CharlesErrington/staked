import React, { useRef } from 'react';
import { View, Animated, Pressable, ViewStyle, Text } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  variant = 'default',
  onPress,
  disabled = false,
  className = '',
  style
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (!onPress || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    if (!onPress || disabled) return;
    
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 5,
    }).start();
  };

  // Base styles
  const baseClasses = 'rounded-2xl p-4';
  
  // Variant styles
  const variantClasses = {
    default: 'bg-white border border-border',
    elevated: 'bg-white',
    outlined: 'bg-transparent border-2 border-border',
    gradient: 'bg-white',
  };

  // Shadow styles based on variant (static, non-animated)
  const getShadowStyle = (): ViewStyle => {
    if (variant === 'outlined') return {};
    
    return {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: variant === 'elevated' ? 6 : 2,
      },
      shadowOpacity: variant === 'elevated' ? 0.15 : 0.08,
      shadowRadius: variant === 'elevated' ? 12 : 6,
      elevation: variant === 'elevated' ? 12 : 4,
    };
  };

  const shadowStyle = getShadowStyle();
  const disabledStyle: ViewStyle = disabled ? { opacity: 0.6 } : {};

  const content = (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
        },
        shadowStyle,
        disabledStyle,
        style,
      ]}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </Animated.View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
      >
        {content}
      </Pressable>
    );
  }

  return content;
};

// Specialized card variants
export const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}> = ({ label, value, icon, trend, className = '' }) => {
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-text-secondary',
  };

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  };

  return (
    <Card variant="elevated" className={`${className}`}>
      <View className="flex-row items-center justify-between mb-2">
        {icon && <View>{icon}</View>}
        {trend && (
          <Text className={`${trendColors[trend]} text-sm font-bold`}>
            {trendIcons[trend]}
          </Text>
        )}
      </View>
      <Text className="text-text-secondary text-xs mb-1">{label}</Text>
      <Text className="text-text-primary text-xl font-bold">{value}</Text>
    </Card>
  );
};

export const InfoCard: React.FC<{
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ type = 'info', title, children, className = '' }) => {
  const typeClasses = {
    info: 'bg-primary-50 border-primary-200',
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    error: 'bg-error-50 border-error-200',
  };

  const typeIcons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  return (
    <View className={`border rounded-xl p-4 ${typeClasses[type]} ${className}`}>
      {title && (
        <View className="flex-row items-center mb-2">
          <Text className="text-lg mr-2">{typeIcons[type]}</Text>
          <Text className="font-semibold text-text-primary">{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
};

