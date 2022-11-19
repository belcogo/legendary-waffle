export function updateVirtualMemory(virtualMemory, setVirtualMemory, newPages) {
  if (!newPages?.length) return;

  const usedSpace = newPages.length;
  const newPagesInverted = newPages.reverse();
  const updatedList = virtualMemory?.memoryArray?.map((frame) => {
    if (!frame?.name) return newPagesInverted.pop();

    return frame;
  });

  setVirtualMemory({ freeSpace: virtualMemory?.freeSpace - usedSpace, memoryArray: updatedList });
}

export function updatePhysicalMemory(physicalMemory, setPhysicalMemory, newPage) {
  if (!newPage?.name) return;

  let usedSpace = 0;
  const {
    freeSpace,
    memoryArray,
    next,
  } = physicalMemory;

  const updatedList = memoryArray?.map((frame) => {
    if (!frame?.name && !usedSpace) {
      usedSpace = 1;
      return { ...newPage, sequencial: next };
    }

    return frame;
  });

  setPhysicalMemory({ freeSpace: freeSpace - usedSpace, memoryArray: updatedList, next: next + 1 });
}
