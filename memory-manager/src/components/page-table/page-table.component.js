import InvalidIcon from '../../assets/invalid.png';
import ValidIcon from '../../assets/valid.png';
import './page-table.style.scss';

export function PageTable({ pageTable }) {
  return (
    <div className="table">
      <div className="headerRow">
        <span className="headerCell">Page</span>
        <span className="headerCell">Physical Frame</span>
        <span className="headerCell last">Valid</span>
      </div>
      <div className="tableBody">
        {pageTable?.map((line, index) => {
          const src = line?.valid ? ValidIcon : InvalidIcon;
          return (
            <div className="row" key={`${line?.frame}-${index}`}>
              <span className="cell">{index}</span>
              <span className="cell">{line?.frame || '-'}</span>
              <div className="cell last">
                <img src={src} alt={line?.valid ? 'valid' : 'invalid'} />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}