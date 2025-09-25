import React from 'react';
import { Text } from 'react-native';

interface HeadingProps {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Heading: React.FC<HeadingProps> = ({ children, size = 'lg', className = '' }) => {
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

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

export const Body: React.FC<BodyProps> = ({ children, className = '' }) => {
  return (
    <Text className={`text-base text-text-primary ${className}`}>
      {children}
    </Text>
  );
};

interface CaptionProps {
  children: React.ReactNode;
  className?: string;
}

export const Caption: React.FC<CaptionProps> = ({ children, className = '' }) => {
  return (
    <Text className={`text-sm text-text-secondary ${className}`}>
      {children}
    </Text>
  );
};