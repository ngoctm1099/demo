import classNames from "classnames";
import Tooltip from "../Tooltip";

const generateRow = (row, column, key) => {
  const data = row[column.field];

  const renderData = () => {
    if (column.render) return column.render(data);
    return data;
  };

  const dataCell = renderData();

  return (
    <td key={key} style={{ ...column?.style }} className={classNames(column?.className, "py-1 px-2 sm:p-2 truncate")}>
      {column?.tooltip ? (
        <Tooltip tooltipData={column?.renderTooltip ? column.renderTooltip(data) : dataCell} className="truncate">
          {dataCell}
        </Tooltip>
      ) : (
        dataCell
      )}
    </td>
  );
};

export default generateRow;
