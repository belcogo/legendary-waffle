import { MemorySizesInKB } from "../enums";

export function generateRandomNumber(type) {
  const factor = MemorySizesInKB[type] || 512;
  return Math.random() * factor;
}
