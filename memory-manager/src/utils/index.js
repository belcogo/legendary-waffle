import { generateRandom, generateRandomColor } from './generate-random.util';
import { sleep } from './sleep.util';
import { calculateSize } from './calculate-memory-used-space.util';
import { getMin } from './get-limits.util';
import {
  updateVirtualMemory,
  updatePhysicalMemory,
  getFreeFramePhysicalMemory,
  updatePageReference,
  freeFrame,
  updateCreatedProcesses,
} from './memory.util';

export {
  generateRandom,
  sleep,
  calculateSize,
  updateVirtualMemory,
  updatePhysicalMemory,
  generateRandomColor,
  getFreeFramePhysicalMemory,
  updatePageReference,
  getMin,
  freeFrame,
  updateCreatedProcesses,
};
