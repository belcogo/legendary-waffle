import { BASE_SIZE } from "../constants";
import { PHISICAL_FACTOR, VIRTUAL_FACTOR } from "../constants/size.constant";

export const Measures = {
  BYTE: 'byte',
  KBYTE: 'KB',
  MBYTE: 'MB',
};

export const MemoryTypes = {
  FRAME: 'FRAME',
  PHISICAL: 'PHISICAL',
  VIRTUAL: 'VIRTUAL',
}

export const MemorySizesInKB = {
  [MemoryTypes.FRAME]: BASE_SIZE,
  [MemoryTypes.PHISICAL]: BASE_SIZE * PHISICAL_FACTOR,
  [MemoryTypes.VIRTUAL]: BASE_SIZE * VIRTUAL_FACTOR,
}