import { MemoryTypes } from "../../enums/size.enum";
import { MemoryUsage } from "../memory-usage/memory-usage.component";
import './memories.style.scss';

export function Memories({ virtualMemory, physicalMemory }) {
  return (
    <div className="content">
      <MemoryUsage {...virtualMemory} type={MemoryTypes.VIRTUAL} />
      <MemoryUsage {...physicalMemory} type={MemoryTypes.PHYSICAL} />
    </div>
  )
}