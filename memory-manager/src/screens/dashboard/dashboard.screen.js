import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header, Memories, PageTable, ProcessesTable } from '../../components';
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
  addNewPageReference,
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
  const [activeTab, setActiveTab] = useState(0);
  const [processToUpdate, setProcessToUpdate] = useState(null);
  const [updatedPageTable, setUpdatedPageTable] = useState(pageTable);

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

  const getPage = useCallback(async (processesList, pMemory, vMemory) => {
    setIsExecuting(true);
    let process = null;
    let processName;
    

    while (!process) {
      processName = `process${generateRandom(false, 0, processesList?.length)}`;
      // eslint-disable-next-line no-loop-func
      process = processesList?.find((process) => process?.name === processName);
    }

    const pageNumber = generateRandom(false, 0, process?.pageCount * 2) || 40;
    const pageName = `page-${pageNumber}`;

    process.pagesRequested += 1; 

    const { memoryArray: physicalMemoryArray } = pMemory || {};

    let page = physicalMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
    if (page) {
      await page?.executable();
      process.pageSuccessCount += 1;
    } else {
      const { memoryArray: virtualMemoryArray } = vMemory || {};
      await sleep();
      process.virtualMemoryAccess += 1;
      page = virtualMemoryArray?.find((page) => page?.process === processName && page?.name === pageName);
      if (page) {
        process.pageSuccessCount += 1;
  
        let frameNumber = getFreeFramePhysicalMemory(physicalMemory);
        if (frameNumber >= 0) {
          const newPageTableReferences = [
            { pageReference: pageNumber, physicalMemoryFrame: `${frameNumber}` },
          ];
          setUpdatedPageTable(newPageTableReferences);
          updatePhysicalMemory(physicalMemory, setPhysicalMemory, page, frameNumber);
        } else {
          const sequencial = getMin(physicalMemory?.memoryArray);
    
          const { pageNumber: pageToFree, frameNumber: newFrameNumber } = freeFrame(physicalMemory, setPhysicalMemory, sequencial, page);
          const newPageTableReferences = [
            { pageReference: pageToFree },
            { pageReference: pageNumber, physicalMemoryFrame: `${newFrameNumber}` },
          ];
          setUpdatedPageTable(newPageTableReferences);
          updatePhysicalMemory(physicalMemory, setPhysicalMemory, page, newFrameNumber);
        }
        await page?.executable();
        
      } else {
        process.pageFailCount += 1;
      }
    }
    setProcessToUpdate(process);
    setIsExecuting(false);
    setWait(false);
  }, [physicalMemory]);

  useEffect(() => {
    async function callGetPage() {
      if (wait || processToUpdate || updatedPageTable) return;

      if (createdProcesses?.length > 0 && !isExecuting && virtualMemory?.freeSpace < 128) {
        await getPage(createdProcesses, physicalMemory, virtualMemory);
      }
    }

    callGetPage();
    
  }, [createdProcesses, getPage, isExecuting, physicalMemory, virtualMemory, wait, pageTable, processToUpdate, updatedPageTable]);

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

  useEffect(() => console.debug('PAGE TABLE -> ', pageTable), [pageTable]);

  useEffect(() => {
    if (processToUpdate) {
      updateCreatedProcesses(createdProcesses, setCreatedProcesses, processToUpdate);
      setProcessToUpdate(null);
    }
  }, [processToUpdate, createdProcesses]);

  useEffect(() => {
    if (updatedPageTable) {
      updatePageReference(pageTable, setPageTable, updatedPageTable);
      setUpdatedPageTable(null);
    }
  }, [updatedPageTable, pageTable]);

  // screen
  return (
    <div className="dashboard">
      <Header />
      <div className="buttonsBox">
        <button className={`${activeTab === 0 ? 'active' : ''}`} onClick={() => setActiveTab(0)}>Memories</button>
        <button className={`${activeTab === 1 ? 'active' : ''}`} onClick={() => setActiveTab(1)}>Page Table</button>
        <button className={`${activeTab === 2 ? 'active' : ''}`} onClick={() => setActiveTab(2)}>Processes Info</button>
      </div>

      {activeTab === 0 && <Memories virtualMemory={virtualMemory} physicalMemory={physicalMemory} />}
      {activeTab === 1 && <PageTable pageTable={pageTable} />}
      {activeTab === 2 && <ProcessesTable createdProcesses={createdProcesses} />}
    </div>
  );
}
