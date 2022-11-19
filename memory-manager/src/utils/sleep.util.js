import { generateRandom } from "./generate-random.util";

export async function sleep() {
  const time = generateRandom(false, 1);
  await new Promise(resolve => setTimeout(resolve, time));
}