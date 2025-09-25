// Component Examples - Headspace-inspired UI components using NativeWind

import React from 'react';
import { Text, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';

// Button Component with Headspace styling
export const Button = ({ 
  variant = 'primary', 
  children, 
  onPress, 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = 'px-8 py-4 rounded-full flex-row items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-orange-500 shadow-soft active:bg-orange-600',
    secondary: 'bg-calm-blue-500 shadow-soft active:bg-calm-blue-600',
    ghost: 'border border-gray-300 bg-transparent active:bg-gray-50',
    danger: 'bg-error shadow-soft active:opacity-80',
    success: 'bg-success shadow-soft active:opacity-80',
  };

  const disabledClasses = disabled ? 'opacity-50' : '';

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${disabledClasses} ${className}`}
      activeOpacity={0.8}
    >
      <Text className={variant === 'ghost' ? 'text-text-primary font-semibold' : 'text-white font-semibold'}>
        {children}
      </Text>
    </TouchableOpacity>
  );
};

// Card Component with soft shadows
export const Card = ({ children, className = '' }) => {
  return (
    <View className={`bg-white rounded-3xl p-6 shadow-soft border border-gray-100 ${className}`}>
      {children}
    </View>
  );
};

// Input Component with Headspace styling
export const Input = ({ 
  placeholder, 
  value, 
  onChangeText, 
  secureTextEntry = false,
  error = false,
  className = '' 
}) => {
  const errorClasses = error ? 'border-error' : 'border-gray-200 focus:border-calm-blue-500';
  
  return (
    <TextInput
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      className={`bg-gray-50 rounded-2xl px-4 py-3 border ${errorClasses} text-text-primary ${className}`}
      placeholderTextColor="#9CA3AF"
    />
  );
};

// Typography Components
export const Heading = ({ children, size = 'lg', className = '' }) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };
  
  return (
    <Text className={`${sizeClasses[size]} font-bold text-text-primary ${className}`}>
      {children}
    </Text>
  );
};

export const Body = ({ children, className = '' }) => {
  return (
    <Text className={`text-base text-text-primary ${className}`}>
      {children}
    </Text>
  );
};

export const Caption = ({ children, className = '' }) => {
  return (
    <Text className={`text-sm text-text-secondary ${className}`}>
      {children}
    </Text>
  );
};

// Habit Card Component
export const HabitCard = ({ habit, onPress }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-success';
      case 'missed': return 'bg-error';
      case 'pending': return 'bg-warning';
      default: return 'bg-gray-200';
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-4">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-1">
            <Heading size="md">{habit.name}</Heading>
            <Caption className="mt-1">{habit.frequency} • {habit.group}</Caption>
          </View>
          <View className={`w-3 h-3 rounded-full ${getStatusColor(habit.status)}`} />
        </View>
        
        <View className="flex-row justify-between items-center mt-4">
          <View className="flex-row items-center">
            <Text className="text-deep-purple-500 font-semibold text-lg">
              ${habit.stake}
            </Text>
            <Caption className="ml-2">at stake</Caption>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-calm-blue-500 font-medium">
              {habit.deadline}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

// Group Card Component
export const GroupCard = ({ group, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card className="mb-4">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Heading size="md">{group.name}</Heading>
            <Caption className="mt-1">{group.memberCount} members</Caption>
          </View>
          
          <View className="bg-orange-100 px-3 py-1 rounded-full">
            <Caption className="text-orange-600 font-medium">
              {group.activeHabits} active
            </Caption>
          </View>
        </View>
        
        <View className="h-px bg-border my-4" />
        
        <View className="flex-row justify-between">
          <View>
            <Caption>You owe</Caption>
            <Text className="text-error font-semibold">
              ${group.totalOwed}
            </Text>
          </View>
          
          <View>
            <Caption>Owed to you</Caption>
            <Text className="text-success font-semibold">
              ${group.totalOwedToYou}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

// Tab Bar Component
export const TabBar = ({ tabs, activeTab, onTabPress }) => {
  return (
    <View className="flex-row bg-white border-t border-gray-100 px-4 pt-2 pb-6">
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => onTabPress(index)}
          className="flex-1 items-center py-2"
          activeOpacity={0.7}
        >
          <View className={`w-6 h-6 mb-1 ${activeTab === index ? 'text-orange-500' : 'text-gray-400'}`}>
            {tab.icon}
          </View>
          <Caption className={activeTab === index ? 'text-orange-500 font-medium' : 'text-gray-400'}>
            {tab.label}
          </Caption>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Empty State Component
export const EmptyState = ({ 
  title, 
  description, 
  actionLabel, 
  onAction 
}) => {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="w-32 h-32 bg-orange-100 rounded-full mb-6" />
      
      <Heading size="lg" className="text-center mb-2">
        {title}
      </Heading>
      
      <Body className="text-center text-text-secondary mb-8">
        {description}
      </Body>
      
      {actionLabel && (
        <Button variant="primary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

// Loading Spinner Component
export const LoadingSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };
  
  return (
    <View className={`${sizeClasses[size]} border-2 border-orange-200 border-t-orange-500 rounded-full animate-spin`} />
  );
};

// Screen Container with consistent padding and background
export const ScreenContainer = ({ children, className = '' }) => {
  return (
    <ScrollView 
      className={`flex-1 bg-background ${className}`}
      contentContainerClassName="px-4 py-6"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

// Success Animation Component (for completed habits)
export const SuccessAnimation = ({ visible, onComplete }) => {
  if (!visible) return null;
  
  return (
    <View className="absolute inset-0 items-center justify-center bg-black/50">
      <View className="bg-white rounded-3xl p-8 items-center animate-slide-up">
        <View className="w-20 h-20 bg-success rounded-full items-center justify-center mb-4">
          <Text className="text-white text-4xl">✓</Text>
        </View>
        <Heading size="lg">Great job!</Heading>
        <Body className="text-center mt-2">Keep up the momentum</Body>
      </View>
    </View>
  );
};