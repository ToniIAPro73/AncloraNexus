// This file centralizes UI component imports to avoid case-sensitivity issues
// Import components from the ui folder with proper casing

import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/button';
import { Badge } from './ui/Badge';
import { Tabs } from './ui/Tabs';
// import { Input } from './ui/Input';
// import { Input } from './ui/Input';
import { Progress } from './ui/Progress';
import { FileUpload } from './ui/FileUpload';
import { Toast, ToastProvider } from './ui/Toast';

// Re-export all UI components
export {
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  Button,
  Badge,
  Tabs,
  // Input,
  Progress,
  FileUpload,
  ToastProvider
};

export type { Toast };

