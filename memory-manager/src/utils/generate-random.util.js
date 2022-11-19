export function generateRandom(isSize) {
  const factor = isSize ? 512 : 3000;
  return Math.floor(Math.random() * factor) + 1;
}
