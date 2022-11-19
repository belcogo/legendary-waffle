import { useEffect, useMemo, useState } from 'react';
import { MemoryUsage } from '../../components';
import { MemorySizesInKB, MemoryTypes } from '../../enums/size.enum';
import { createProcessWithPages } from '../../services/process.service';
import { calculateSize, generateRandom, updatePhysicalMemory, updateVirtualMemory } from '../../utils';
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

  // useMemo
  const nextProcessName = useMemo(() => `process${createdProcesses?.length}`, [createdProcesses?.length]);
  const hasFreeSpace = useMemo(() => calculateSize(createdProcesses) < MemorySizesInKB.VIRTUAL, [createdProcesses]);

  // effects
  useEffect(() => {
    const { process, pages } = createProcessWithPages(nextProcessName);
    if (hasFreeSpace) setNewProcessWithPages({ process, pages });
  }, [hasFreeSpace, nextProcessName, newProcessWithPages, newPages]);

  useEffect(() => {
    if (!hasFreeSpace) {
      const processName = `process${generateRandom(false, 0, createdProcesses?.length)}`;
      const process = createdProcesses?.find((process) => process?.name === processName);
      console.debug(process);
      const pageName = `page-${generateRandom(false, 0, process?.pageCount)}`;
      console.debug(pageName);
    };
  }, [hasFreeSpace, createdProcesses]);


  useEffect(() => {
    if (newProcessWithPages) {
      const usedSpace = calculateSize(createdProcesses);

      if (
        (usedSpace + newProcessWithPages?.process?.pageCount) <= MemorySizesInKB.VIRTUAL
        && !createdProcesses.map(({ name }) => name).includes(newProcessWithPages?.process?.name)
      ) {
        setTimeout(() => {
          setCreatedProcesses([...createdProcesses, newProcessWithPages?.process]);
          setNewPages(newProcessWithPages?.pages);
          setNewProcessWithPages(null);
        }, 0);
      }
    }
  }, [createdProcesses, newProcessWithPages, setCreatedProcesses]);

  useEffect(() => {
    const processesNames = virtualMemory?.memoryArray?.map((item) => item?.process || 'undefined');
    const validProcessesNames = Array.from(processesNames ? new Set(processesNames) : [])?.filter((name) => name !== 'undefined');
    const processIsAlreadyInMemory = validProcessesNames.includes(newPages?.[0]?.process);

    if (newPages?.length && newPages?.length < virtualMemory?.freeSpace && !processIsAlreadyInMemory) {
      if (virtualMemory?.freeSpace > 0) updateVirtualMemory(virtualMemory, setVirtualMemory, newPages);
      setNewPages(null);
    }
  }, [newPages, virtualMemory]);

  // useEffect(() => {
  //   console.debug('VIRTUALMEMORY -> ', virtualMemory);
  // }, [virtualMemory]);

  // useEffect(() => {
  //   console.debug('PHYSICALMEMORY -> ', physicalMemory);
  // }, [physicalMemory]);

  // screen
  return (
    <div className="dashboard">
      <MemoryUsage {...virtualMemory} type={MemoryTypes.VIRTUAL} />
      <MemoryUsage {...physicalMemory} type={MemoryTypes.PHYSICAL} />
    </div>
  );
}
