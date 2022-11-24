import './processes-table.style.scss';

export function ProcessesTable({ createdProcesses }) {
  return (
    <div className="table">
      <div className="headerRow">
        <span className="headerCell">Process</span>
        <span className="headerCell">Page count</span>
        <span className="headerCell">Total requests</span>
        <span className="headerCell large">Total virtual memory accesses</span>
        <span className="headerCell">Total success</span>
        <span className="headerCell">Total fails</span>
      </div>
      <div className="tableBody">
        {createdProcesses?.map((process, index) => {
          return (
            <div className="row" key={`${process?.name}-${index}`}>
              <span className="cell">{process?.name}</span>
              <span className="cell">{process?.pageCount || '-'}</span>
              <span className="cell">{process?.pagesRequested || '-'}</span>
              <span className="cell large">{process?.virtualMemoryAccess || '-'}</span>
              <span className="cell">{process?.pageSuccessCount || '-'}</span>
              <span className="cell">{process?.pageFailCount || '-'}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}