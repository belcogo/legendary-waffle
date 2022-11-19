import { generateRandom } from "./generate-random.util";

export async function sleep() {
  const time = generateRandom();
  await new Promise(resolve => setTimeout(resolve, time));
}