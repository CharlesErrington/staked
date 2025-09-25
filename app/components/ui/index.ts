// Legacy exports - components are being migrated to atomic design structure
// These will be deprecated once migration is complete
export { Button } from '../atoms/Button';
export { Card } from './Card';
export { Input } from '../atoms/Input';
export { Heading, Body, Caption } from './Typography';

// New atomic design exports
export * from '../atoms';
export * from '../molecules';
export * from '../organisms';
export * from '../templates';