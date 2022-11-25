import { useRecoilValue } from "recoil"
import { processToShowState } from "../../atoms/process.atom"

export function ProcessDetail({ createdProcesses }) {
  const processName = useRecoilValue(processToShowState);

  const process = createdProcesses?.find((process) => process?.name === processName);

  return (
    <div className="table">
      <div className="headerRow">
        <span className="headerCell medium">PROCESS INFO</span>
      </div>
      <div className="tableBody">
        {Object.keys(process || {})?.map((key) => {
          return (
            <div className="row">
              <span className="cell">{key}</span>
              <span className="cell">{process?.[key]}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}