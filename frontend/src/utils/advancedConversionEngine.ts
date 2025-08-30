export interface ConversionPath {
  path: string[];
  steps: number;
  quality: number;
  isRecommended?: boolean;
  estimatedQuality: number;
  estimatedTime?: number;
  description?: string;
  warningMessage?: string;
}

export const getBestPaths = (): ConversionPath[] => [
  {
    path: ['txt', 'pdf'],
    steps: 1,
    quality: 100,
    estimatedQuality: 100,
    estimatedTime: 0.5,
    description: 'Direct conversion',
  },
];

