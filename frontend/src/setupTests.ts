import { vi } from 'vitest';

const mockSocket = {
  on: vi.fn(),
  disconnect: vi.fn(),
};

const apiService = {
  connectProgress: vi.fn(() => mockSocket),
};

vi.stubGlobal('apiService', apiService);

