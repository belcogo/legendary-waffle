import { useEffect, useMemo, useState } from 'react';
import { MemorySizesInKB } from '../../enums/size.enum';
import { createProcessWithPages } from '../../services/process.service';
import { calculateSize, updatePhysicalMemory, updateVirtualMemory } from '../../utils';
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
  const [newProcessWithPages, setNewProcessWithPages] = useState();
  const [newPages, setNewPages] = useState();

  // useMemo
  const nextProcessName = useMemo(() => `process${createdProcesses?.length}`, [createdProcesses?.length]);
  const hasFreeSpace = useMemo(() => calculateSize(createdProcesses) < MemorySizesInKB.VIRTUAL, [createdProcesses]);

  // effects
  useEffect(() => {
    const { process, pages } = createProcessWithPages(nextProcessName);
    if (hasFreeSpace) setNewProcessWithPages({ process, pages });
  }, [hasFreeSpace, nextProcessName, newProcessWithPages]);

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
    const processIsAlreadyInMemory = virtualMemory?.memoryArray?.map((item) => item?.process).includes(newPages?.[0]?.process);
    if (newPages?.length && !processIsAlreadyInMemory) {
      if (physicalMemory?.freeSpace > 0) updatePhysicalMemory(physicalMemory, setPhysicalMemory, newPages[0]);
      if (virtualMemory?.freeSpace > 0) updateVirtualMemory(virtualMemory, setVirtualMemory, newPages);

      setNewPages(null);
    }
  }, [newPages, physicalMemory, virtualMemory]);

  useEffect(() => {
    console.debug('VIRTUALMEMORY -> ', virtualMemory);
  }, [virtualMemory]);

  useEffect(() => {
    console.debug('PHYSICALMEMORY -> ', physicalMemory);
  }, [physicalMemory]);

  // screen
  return <div className="dashboard">Oi</div>;
}
