import { MemorySizesInKB } from "../enums/size.enum";
import { generateRandom, sleep } from "../utils";

export function createProcess({ name }) {
  const size = generateRandom(true);
  return {
    name,
    size,
    pagesRequested: 0,
    pageFailCount: 0,
    pageSucessCount: 0,
    pageCount: Math.ceil(size/MemorySizesInKB.FRAME),
  }
}

export function createProcessPage({ process, name, sequencial }) {
  return {
    process,
    name,
    sequencial,
    executable: sleep,
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
  for (let i = 0; i < process.pageCount; i++) {
    const page = createProcessPage({ process: processName, name: `page-${i}`, sequencial: null });
    pages.push(page);
  }

  return {
    process,
    pages,
  }
}
