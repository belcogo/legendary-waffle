import { MemorySizesInKB } from "../enums/size.enum";
import { generateRandom, generateRandomColor, sleep } from "../utils";

export function createProcess({ name }) {
  const size = generateRandom(true, 1);
  return {
    name,
    size,
    pagesRequested: 0,
    pageFailCount: 0,
    pageSucessCount: 0,
    pageCount: Math.ceil(size/MemorySizesInKB.FRAME),
    color: generateRandomColor(),
  }
}

export function createProcessPage({ process, name, sequencial, color }) {
  return {
    process,
    name,
    sequencial,
    executable: sleep,
    color,
  };
}

export async function executeProcessPage({ name, executable }) {
  await executable();
  // return content to be shown

  return `${name} - DONE`;
}

export function createProcessWithPages(processName) {
  const process = createProcess({ name: processName });
  const pages = [];
  const { color } = process;
  for (let i = 0; i < process.pageCount; i++) {
    const page = createProcessPage({ process: processName, name: `page-${i}`, sequencial: null, color });
    pages.push(page);
  }

  return {
    process,
    pages,
  }
}
