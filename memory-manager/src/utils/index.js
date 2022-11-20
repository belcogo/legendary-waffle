import { generateRandom, generateRandomColor } from './generate-random.util';
import { sleep } from './sleep.util';
import { calculateSize } from './calculate-memory-used-space.util';
import { getMin } from './get-limits.util';
import { updateVirtualMemory, updatePhysicalMemory, getFreeFramePhysicalMemory, addNewPageReference, updatePageReference, freeFrame } from './memory.util';

export {
  generateRandom,
  sleep,
  calculateSize,
  updateVirtualMemory,
  updatePhysicalMemory,
  generateRandomColor,
  getFreeFramePhysicalMemory,
  addNewPageReference,
  updatePageReference,
  getMin,
  freeFrame,
};
