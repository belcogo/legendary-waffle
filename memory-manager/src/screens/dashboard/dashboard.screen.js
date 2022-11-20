import { useCallback, useEffect, useMemo, useState } from 'react';
import { MemoryUsage } from '../../components';
import { MemorySizesInKB, MemoryTypes } from '../../enums/size.enum';
import { createProcessWithPages } from '../../services/process.service';
import {
  calculateSize,
  generateRandom,
  getFreeFramePhysicalMemory,
  sleep,
  addNewPageReference,
  updatePhysicalMemory,
  updateVirtualMemory,
  updatePageReference,
  getMin,
  freeFrame,
} from '../../utils';
import './dashboard.style.scss';

export function DashboardScreen() {
  // useState
  const [createdProcesses, setCreatedProcesses] = useState([]);
  const [virtualMemory, setVirtualMemory] = useState({
    memoryArray: new Array(MemorySizesInKB.VIRTUAL).fill({}),
    freeSpace: MemorySizesInKB.VIRTUAL,
  });
  const [physicalMemory, setPhysicalMemory] = useState({
    memoryArray: new Array(MemorySizesInKB.PHYSICAL).fill({}),
    freeSpace: MemorySizesInKB.PHYSICAL,
    next: 0,
  });
  const [pageTable, setPageTable] = useState([]);
  const [newProcessWithPages, setNewProcessWithPages] = useState();
  const [newPages, setNewPages] = useState();
  const [isExecuting, setIsExecuting] = useState();
  const [wait, setWait] = useState();

  // useMemo
  const nextProcessName = useMemo(() => `process${createdProcesses?.length}`, [createdProcesses?.length]);
  const hasFreeSpace = useMemo(() => calculateSize(createdProcesses) < MemorySizesInKB.VIRTUAL, [createdProcesses]);

  // effects
  useEffect(() => {
    async function callCreateProcessWithPages() {
      const { process, pages } = await createProcessWithPages(nextProcessName);
      if (hasFreeSpace) setNewProcessWithPages({ process, pages });
    }
    
    callCreateProcessWithPages();
  }, [hasFreeSpace, nextProcessName, newProcessWithPages, newPages]);

  const getPage = useCallback(async (createdProcesses, pageTable, physicalMemory, virtualMemory) => {
    console.debug(physicalMemory);
    console.debug(virtualMemory);
    setIsExecuting(true);
    const processName = `process${generateRandom(false, 0, createdProcesses?.length)}`;
    const process = createdProcesses?.find((process) => process?.name === processName);
    const pageNumber = generateRandom(false, 0, process?.pageCount);
    const pageName = `page-${pageNumber}`;
    console.debug('PROCESS & PAGE -> ', processName, pageName);

    const { memoryArray: physicalMemoryArray } = physicalMemory || {};

    let page = physicalMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
    console.debug(page);
    if (page) {
      console.debug('OK');
      await page?.executable();
      setIsExecuting(false);
    } else {
      console.debug('TLB FAIL');
      // TLB FAIL
      const { memoryArray: virtualMemoryArray } = virtualMemory || {};
      await sleep();
      page = virtualMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
      if (page) {
        console.debug('TLB FAIL -> OK');
        let frameNumber = getFreeFramePhysicalMemory(physicalMemory);
        if (frameNumber >= 0) {
          const aaa = [
            { pageReference: pageNumber, physicalMemoryFrame: `${frameNumber}` },
          ];
          updatePageReference(pageTable, setPageTable, aaa);
          updatePhysicalMemory(physicalMemory, setPhysicalMemory, page, frameNumber);
        } else {
          const sequencial = getMin(physicalMemory?.memoryArray);
          console.debug('SEQUENCIAL -> ', sequencial);
          const { pageNumber: pageToFree, frameNumber: newFrameNumber } = freeFrame(physicalMemory, setPhysicalMemory, sequencial, page);
          const aaa = [
            { pageReference: pageToFree },
            { pageReference: pageNumber, physicalMemoryFrame: `${newFrameNumber}` },
          ];
          updatePageReference(pageTable, setPageTable, aaa);
          updatePhysicalMemory(physicalMemory, setPhysicalMemory, page, newFrameNumber);
        }
        await page?.executable();
        setIsExecuting(false);
        setWait(false);
      } else {
        // PAGE FAIL
        console.debug('PAGE FAIL');
      }
    }
  }, []);

  useEffect(() => {
    if (wait) return;

    if (createdProcesses?.length > 0 && !isExecuting && virtualMemory?.freeSpace < 128) {
      getPage(createdProcesses, pageTable, physicalMemory, virtualMemory);
    }
  }, [createdProcesses, getPage, isExecuting, pageTable, physicalMemory, virtualMemory, wait]);

  useEffect(() => {
    if (newProcessWithPages) {
      setWait(true);
      const usedSpace = calculateSize(createdProcesses);

      if (
        (usedSpace + newProcessWithPages?.process?.pageCount) <= MemorySizesInKB.VIRTUAL
        && !createdProcesses.map(({ name }) => name).includes(newProcessWithPages?.process?.name)
      ) {
        setCreatedProcesses([...createdProcesses, newProcessWithPages?.process]);
        addNewPageReference(pageTable, setPageTable);
        setNewPages(newProcessWithPages?.pages);
        setNewProcessWithPages(null);
      }
    }
  }, [createdProcesses, newProcessWithPages, pageTable, setCreatedProcesses]);

  useEffect(() => {
    const processesNames = virtualMemory?.memoryArray?.map((item) => item?.process || 'undefined');
    const validProcessesNames = Array.from(processesNames ? new Set(processesNames) : [])?.filter((name) => name !== 'undefined');
    const processIsAlreadyInMemory = validProcessesNames.includes(newPages?.[0]?.process);

    if (newPages?.length <= virtualMemory?.freeSpace && !processIsAlreadyInMemory) {
      updateVirtualMemory(virtualMemory, setVirtualMemory, newPages);
      setNewPages(null);
    }
    setWait(false);
  }, [newPages, virtualMemory]);

  // useEffect(() => {
  //   console.debug('VIRTUALMEMORY -> ', virtualMemory);
  // }, [virtualMemory]);

  // useEffect(() => {
  //   console.debug('PHYSICALMEMORY -> ', physicalMemory);
  // }, [physicalMemory]);

  // useEffect(() => {
  //   console.debug('PAGETABLE -> ', pageTable);
  // }, [pageTable]);

  // screen
  return (
    <div className="dashboard">
      <MemoryUsage {...virtualMemory} type={MemoryTypes.VIRTUAL} />
      <MemoryUsage {...physicalMemory} type={MemoryTypes.PHYSICAL} />
    </div>
  );
}
