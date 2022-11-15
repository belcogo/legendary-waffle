import { atom } from 'recoil';
import { MemorySizesInKB, MemoryTypes } from '../enums';

export const virtualMemoryState = atom({
  key: 'virtualMemoryState',
  defaut: {
    memoryArray: new Array(MemorySizesInKB[MemoryTypes.VIRTUAL]),
  }
});

const numberOfFrames = MemorySizesInKB[MemoryTypes.PHISICAL]/MemorySizesInKB[MemoryTypes.FRAME];


export const phisicalMemoryState = atom({
  key: 'phisicalMemoryState',
  defaut: {
    memoryArray: new Array(numberOfFrames),
  }
});

// frame structure { frame: int, valid: bool }
export const pageTableState = atom({
  key: 'pageTableState',
  default: new Array(numberOfFrames),
})
