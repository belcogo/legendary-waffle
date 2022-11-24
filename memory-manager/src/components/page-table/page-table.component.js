import ValidIcon from '../../assets/valid.png';
import InvalidIcon from '../../assets/invalid.png';
import './page-table.style.scss';

const icons = {
  valid: ValidIcon,
  invalid: InvalidIcon,
};

export function PageTable({ pageTable }) {
  return (
    <div className="table small">
      <div className="headerRow">
        <span className="headerCell">Virtual frame</span>
        <span className="headerCell">Physical frame</span>
        <span className="headerCell last">valid</span>
      </div>
      <div className="tableBody">
        {pageTable?.map((item, index) => {
          const frameStatus = item?.valid ? 'valid' : 'invalid';
          return (
            <div className="row" key={`page-${index}-${item?.frame}`}>
              <span className="cell">{index}</span>
              <span className="cell">{item?.frame || '-'}</span>
              <span className="cell last">
                <img src={icons[frameStatus]} alt={frameStatus} />
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}