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

export function updatePhysicalMemory(physicalMemory, setPhysicalMemory, newPage, desiredIndex) {
  if (!newPage?.name) return;

  let usedSpace = 0;
  const {
    freeSpace,
    memoryArray,
    next,
  } = physicalMemory || {};

  const updatedList = memoryArray?.map((frame, index) => {
    if (index === desiredIndex) {
      usedSpace = 1;
      return { ...newPage, sequencial: next };
    }

    return frame;
  });

  const newFreeSpace = freeSpace > 0 ? freeSpace - usedSpace : 0;

  setPhysicalMemory({ freeSpace: newFreeSpace, memoryArray: updatedList, next: next + 1 });
}

export function getFreeFramePhysicalMemory({ memoryArray }) {
  return memoryArray?.findIndex((frame) => !frame?.name);
}

export function addNewPageReference(pageTable, setPageTable) {
  setPageTable([...pageTable, { frame: null, valid: false }])
}

export function updatePageReference(pageTable, setPageTable, updatedItems) {
  let itemsToUpdate = updatedItems?.length;
  const updatedList = pageTable?.map((reference, index) => {
    if (itemsToUpdate) {
      const updatedItem = updatedItems?.find((item) => item?.pageReference === index);
      if (updatedItem) {
        itemsToUpdate--;
        return { frame: updatedItem?.physicalMemoryFrame, valid: !!updatedItem?.physicalMemoryFrame };
      }
    }

    return reference;
  });
  setPageTable(updatedList);
}

export function freeFrame(physicalMemory, setPhysicalMemory, sequencial, newPage) {
  let pageNumber;
  let frameNumber;
  const updatedList = physicalMemory?.memoryArray?.map((page, index) => {
    if (page?.sequencial === sequencial) {
      pageNumber = Number(page?.name?.replace('page-', ''));
      frameNumber = index;
    }

    return page;
  });

  setPhysicalMemory(updatedList);

  return { pageNumber, frameNumber };
}

export function updateCreatedProcesses(createdProcesses, setCreatedProcesses, updatedProcess) {
  const updatedList = createdProcesses?.map((process) => {
    if (process?.name === updatedProcess?.name) {
      return updatedProcess;
    }

    return process;
  });

  setCreatedProcesses(updatedList);
}
