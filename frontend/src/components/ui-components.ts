// This file centralizes UI component imports to avoid case-sensitivity issues
// Import components from the ui folder with proper casing

import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Tabs, Progress, FileUpload, Toast, ToastProvider } from './ui';

// Re-export all UI components
export type { Toast };

export {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  Progress,
  FileUpload,
  ToastProvider
};