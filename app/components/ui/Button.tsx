import React, { useRef } from 'react';
import { 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  Animated,
  ViewStyle,
  TextStyle,
  Pressable,
  View
} from 'react-native';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  onPress, 
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '' 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.95,
        useNativeDriver: true,
        tension: 100,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0.8,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 5,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Size classes
  const sizeClasses = {
    sm: 'px-4 py-2',
    md: 'px-6 py-3',
    lg: 'px-8 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  // Base classes with improved styling
  const baseClasses = `${sizeClasses[size]} rounded-xl flex-row items-center justify-center`;
  
  // Variant classes with better colors matching our design system
  const variantClasses = {
    primary: 'bg-primary', // sage green
    secondary: 'bg-secondary', // warm beige
    ghost: 'border-2 border-border bg-transparent',
    danger: 'bg-error',
    success: 'bg-success',
  };

  // Shadow styles for elevation
  const shadowStyle: ViewStyle = variant !== 'ghost' ? {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  } : {};

  // Disabled styles
  const disabledStyle: ViewStyle = (disabled || loading) ? {
    opacity: 0.5,
  } : {};

  // Text color based on variant
  const getTextColor = () => {
    switch(variant) {
      case 'primary':
        return 'text-white';
      case 'secondary':
        return 'text-text-primary';
      case 'ghost':
        return 'text-primary';
      case 'danger':
      case 'success':
        return 'text-white';
      default:
        return 'text-white';
    }
  };

  const textColor = getTextColor();
  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <Animated.View
      style={[
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
        shadowStyle,
        disabledStyle,
      ]}
      className={widthClass}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      >
        {loading ? (
          <ActivityIndicator 
            size={size === 'sm' ? 'small' : 'small'}
            color={variant === 'secondary' || variant === 'ghost' ? '#2D3436' : '#FFFFFF'} 
          />
        ) : (
          <View className="flex-row items-center justify-center gap-2">
            {icon && iconPosition === 'left' && (
              <View>{icon}</View>
            )}
            <Text className={`${textColor} font-semibold ${textSizeClasses[size]}`}>
              {children}
            </Text>
            {icon && iconPosition === 'right' && (
              <View>{icon}</View>
            )}
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
};

// Export additional button variants for specific use cases
export const IconButton: React.FC<{
  icon: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}> = ({ icon, onPress, disabled = false, variant = 'ghost', size = 'md' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const variantClasses = {
    primary: 'bg-primary',
    secondary: 'bg-secondary',
    ghost: 'bg-transparent',
  };

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
      }}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        className={`${sizeClasses[size]} ${variantClasses[variant]} rounded-full items-center justify-center ${disabled ? 'opacity-50' : ''}`}
      >
        {icon}
      </Pressable>
    </Animated.View>
  );
};