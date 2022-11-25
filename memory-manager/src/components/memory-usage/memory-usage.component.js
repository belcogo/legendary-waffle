import { useEffect, useMemo, useState } from "react";
import { useSetRecoilState } from "recoil";
import { processToShowState } from "../../atoms/process.atom";
import { MemoryTitle } from "../../enums";
import { MemorySizesInKB } from "../../enums/size.enum";
import './memory-usage.style.scss';

export function MemoryUsage({ memoryArray, freeSpace, type, createdProcesses }) {
  const [processesNames, setProcessesNames] = useState();
  const [usagePerProcess, setUsagePerProcess] = useState();
  const freePercentage = useMemo(() => Math.round(100*freeSpace/MemorySizesInKB[type]), [freeSpace, type]);
  const setProcessToShow = useSetRecoilState(processToShowState);

  useEffect(() => {
    const processesNames = memoryArray?.map((item) =>  item?.process || 'undefined');
    const validProcessesNames = Array.from(new Set(processesNames));
    setProcessesNames(processesNames ? validProcessesNames?.filter((a) => a !== 'undefined') : []);
  }, [memoryArray, type]);

  useEffect(() => {
    const newUsagePerProcess = processesNames?.map((name) => {
      const pages = memoryArray?.filter((page) => page?.process === name);
      const pageCount = pages?.length;
      const color = pages?.[0]?.color;
      return {
        process: name,
        percentage: Math.round((100*pageCount)/MemorySizesInKB[type]),
        color,
        pageCount,
      };
    });    
    setUsagePerProcess(newUsagePerProcess);
  }, [memoryArray, processesNames, type]);

  const handleClick = (processName) => {
    setProcessToShow(processName);
  }

  return (
    <div className="memoryContainer">
      <div className="usageContainer">
        <h2>{MemoryTitle[type]}</h2>
        <div className="memory">
          {usagePerProcess?.map(({ process, percentage, color }) => {
            return (
              <div className="allocation" key={`${process}-${percentage}`} style={{ flex: percentage, backgroundColor: `#${color}` }} />
            )
          })}
          <div className="allocation" key={`free-${freePercentage}`} style={{ flex: freePercentage, backgroundColor: `#FFFFFF` }} />
        </div>
      </div>

      <ul className="subtitle">
        {usagePerProcess?.map(({ process, percentage, color, pageCount }) => {
          return (
            <li key={`usage_${process}-${percentage}`} style={{ display: 'flex' }} onClick={() => handleClick(process)} >
              <div className="processColor" style={{ backgroundColor: `#${color}` }} />
              <span className="label">{`${process} -> ${percentage}% | ${pageCount}/${MemorySizesInKB[type]} frames`}</span>
            </li>
          )
        })}
        <li style={{ display: 'flex' }} >
          <div className="processColor" style={{ backgroundColor: `#FFFFFF` }} />
          <span className="label">{`free -> ${freePercentage}% | ${freeSpace}/${MemorySizesInKB[type]} frames`}</span>
        </li>
      </ul>
    </div>
  );
}
