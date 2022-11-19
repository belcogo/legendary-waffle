export function generateRandom(isSize, constant, superiorLimit) {
  const factor = superiorLimit || (isSize ? 512 : 3000);
  return Math.floor(Math.random() * factor) + constant;
}

const freeSpaceColor = 'FFFFFF';

export function generateRandomColor() {
  let color = 'FFFFFF';
  while (color === freeSpaceColor) {
    color = Math.floor(Math.random()*16777215).toString(16);
    if (color?.length < 6) color = color.padEnd(7, '0');
    if (color?.length > 6) color = color.substring(0, 6);
  }
  return color;
}
