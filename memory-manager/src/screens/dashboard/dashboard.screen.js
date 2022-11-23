import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header, Memories, PageTable } from '../../components';
import { MemorySizesInKB } from '../../enums/size.enum';
import { createProcessWithPages } from '../../services/process.service';
import {
  calculateSize,
  generateRandom,
  getFreeFramePhysicalMemory,
  sleep,
  updatePhysicalMemory,
  updateVirtualMemory,
  updatePageReference,
  getMin,
  freeFrame,
  updateCreatedProcesses,
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
  const [pageTable, setPageTable] = useState(new Array(MemorySizesInKB.VIRTUAL).fill({ frame: null, valid: false }));
  const [newProcessWithPages, setNewProcessWithPages] = useState();
  const [newPages, setNewPages] = useState();
  const [isExecuting, setIsExecuting] = useState();
  const [wait, setWait] = useState();
  const [activeTab, setActiveTab] = useState(0);

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

  const getPage = useCallback(async (processesList, pageTable, physicalMemory, virtualMemory) => {
    console.debug(physicalMemory);
    console.debug(virtualMemory);
    setIsExecuting(true);
    let process = null;
    let processName;
    

    while (!process) {
      processName = `process${generateRandom(false, 0, processesList?.length)}`;
      process = processesList?.find((process) => process?.name === processName);
    }

    const pageNumber = generateRandom(false, 0, process?.pageCount);
    const pageName = `page-${pageNumber}`;
    console.debug('PROCESS & PAGE -> ', processName, pageName);

    process.pagesRequested += 1; 

    const { memoryArray: physicalMemoryArray } = physicalMemory || {};

    let page = physicalMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
    console.debug(page);
    if (page) {
      await page?.executable();
      console.debug('OK');
      setIsExecuting(false);
      process.pageSucessCount += 1;
    } else {
      console.debug('TLB FAIL');
      // TLB FAIL
      const { memoryArray: virtualMemoryArray } = virtualMemory || {};
      await sleep();
      page = virtualMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
      if (page) {
        process.pageSucessCount += 1;
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
        process.pageFailCount += 1;
        console.debug('PAGE FAIL');
        setIsExecuting(false);
      }
    }
    setIsExecuting(false);
    updateCreatedProcesses(processesList, setCreatedProcesses, process);
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

  // screen
  return (
    <div className="dashboard">
      <Header />
      <div className="buttonsBox">
        <button className={`${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Memories</button>
        <button className={`${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Page Table</button>
      </div>

      {activeTab === 0 && <Memories virtualMemory={virtualMemory} physicalMemory={physicalMemory} />}
      {activeTab === 1 && <PageTable pageTable={pageTable} />}
    </div>
  );
}
