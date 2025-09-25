import React, { useRef, useState } from 'react';
import { 
  TextInput, 
  View, 
  Text, 
  Animated,
  TouchableOpacity,
  TextInputProps,
  Platform
} from 'react-native';

interface InputProps extends Omit<TextInputProps, 'onChangeText' | 'value'> {
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  error?: string;
  label?: string;
  helper?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  showClearButton?: boolean;
  className?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
}

export const Input: React.FC<InputProps> = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  error,
  label,
  helper,
  keyboardType = 'default',
  autoCapitalize = 'none',
  leftIcon,
  rightIcon,
  onRightIconPress,
  showClearButton = false,
  className = '',
  multiline = false,
  numberOfLines = 1,
  maxLength,
  ...restProps
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 100,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handleClear = () => {
    onChangeText('');
  };

  // Static colors based on state
  const borderColor = error ? '#FF6B6B' : (isFocused ? '#90B2AC' : '#E1E4E8');
  const labelColor = error ? '#FF6B6B' : (isFocused ? '#90B2AC' : '#636E72');

  const inputHeight = multiline ? (numberOfLines * 24 + 16) : 'auto';

  return (
    <View className="mb-4">
      {label && (
        <Text 
          style={{ color: labelColor }}
          className="font-medium mb-2 text-sm"
        >
          {label}
          {restProps.required && <Text className="text-error"> *</Text>}
        </Text>
      )}
      
      <Animated.View
        style={{
          borderColor: borderColor,
          borderWidth: 2,
          transform: [{ scale: scaleAnim }],
          shadowColor: isFocused ? '#90B2AC' : '#000',
          shadowOffset: {
            width: 0,
            height: isFocused ? 4 : 1,
          },
          shadowOpacity: isFocused ? 0.15 : 0.05,
          shadowRadius: isFocused ? 8 : 2,
          elevation: isFocused ? 8 : 2,
        }}
        className={`bg-white rounded-xl flex-row items-center ${multiline ? 'items-start' : ''}`}
      >
        {leftIcon && (
          <View className="pl-3">
            {leftIcon}
          </View>
        )}
        
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          style={{
            minHeight: inputHeight,
            paddingTop: multiline ? 12 : Platform.OS === 'ios' ? 14 : 10,
            paddingBottom: multiline ? 12 : Platform.OS === 'ios' ? 14 : 10,
            textAlignVertical: multiline ? 'top' : 'center',
          }}
          className={`flex-1 px-4 text-text-primary text-base ${className}`}
          placeholderTextColor="#9CA3AF"
          {...restProps}
        />
        
        {(showClearButton && value.length > 0 && !rightIcon) && (
          <TouchableOpacity 
            onPress={handleClear}
            className="pr-3"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className="text-gray-400 text-lg">✕</Text>
          </TouchableOpacity>
        )}
        
        {rightIcon && (
          <TouchableOpacity 
            onPress={onRightIconPress}
            className="pr-3"
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {helper && !error && (
        <Text className="text-text-secondary text-xs mt-1 ml-2">
          {helper}
        </Text>
      )}
      
      {error && (
        <View className="flex-row items-center mt-1 ml-2">
          <Text className="text-error text-xs">⚠ </Text>
          <Text className="text-error text-xs">
            {error}
          </Text>
        </View>
      )}
      
      {maxLength && (
        <Text className="text-text-secondary text-xs mt-1 mr-2 text-right">
          {value.length}/{maxLength}
        </Text>
      )}
    </View>
  );
};

// Password Input with show/hide toggle
export const PasswordInput: React.FC<Omit<InputProps, 'secureTextEntry' | 'rightIcon'>> = (props) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      {...props}
      secureTextEntry={!showPassword}
      rightIcon={
        <Text className="text-text-secondary">
          {showPassword ? '👁' : '👁‍🗨'}
        </Text>
      }
      onRightIconPress={() => setShowPassword(!showPassword)}
    />
  );
};

// Search Input with search icon
export const SearchInput: React.FC<Omit<InputProps, 'leftIcon'>> = (props) => {
  return (
    <Input
      {...props}
      leftIcon={<Text className="text-text-secondary">🔍</Text>}
      showClearButton
      placeholder={props.placeholder || "Search..."}
    />
  );
};