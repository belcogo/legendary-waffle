import { useEffect, useMemo, useState } from "react";
import { MemorySizesInKB } from "../../enums/size.enum";
import './memory-usage.style.scss';

export function MemoryUsage({ memoryArray, freeSpace, type }) {
  const [processesNames, setProcessesNames] = useState();
  const [usagePerProcess, setUsagePerProcess] = useState();
  const freePercentage = useMemo(() => Math.round(100*freeSpace/MemorySizesInKB[type]), [freeSpace, type]);

  useEffect(() => {
    const processesNames = memoryArray?.map((item) =>  item?.process || 'undefined');
    const validProcessesNames = Array.from(new Set(processesNames));
    setProcessesNames(processesNames ? validProcessesNames?.filter((a) => a !== 'undefined') : []);
  }, [memoryArray]);

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

  return (
    <div>
      <div className="memory">
        {usagePerProcess?.map(({ process, percentage, color }) => {
          return (
            <div className="allocation" key={`${process}-${percentage}`} style={{ flex: percentage, backgroundColor: `#${color}` }} />
          )
        })}
        <div className="allocation" key={`free-${freePercentage}`} style={{ flex: freePercentage, backgroundColor: `#FFFFFF` }} />
      </div>
      {usagePerProcess?.map(({ process, percentage, color, pageCount }) => {
        return (
          <div key={`usage_${process}-${percentage}`} style={{ display: 'flex' }} >
            <div style={{ width: '30px', height: '30px', borderRadius: '30px', backgroundColor: `#${color}` }} />
            <span>{`${process} -> ${percentage}% | (${pageCount}/${MemorySizesInKB[type]} frames)`}</span>
          </div>
        )
      })}
      <div style={{ display: 'flex' }} >
        <div style={{ width: '30px', height: '30px', borderRadius: '30px', backgroundColor: `#FFFFFF` }} />
        <span>{`free -> ${freePercentage}% | (${freeSpace}/${MemorySizesInKB[type]} frames)`}</span>
      </div>
    </div>
  );
}
