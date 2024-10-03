import classNames from "classnames";
import React from "react";
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";

interface TableProps {
  rows: any;
  columns: any;
  className?: string;
  collapsed?: boolean;
}

const Table = ({ rows, columns, className, collapsed }: TableProps) => {
  return (
    <table className={classNames("overflow-hidden whitespace-nowrap divide-y divide-gray-200", className)}>
      <thead className="text-xs sm:text-sm text-gray-500 uppercase">
        <tr>
          {collapsed && <th className="p-3"></th>}
          {columns.map((column, index) => (
            <TableHeader column={column} key={`${column.title}-${index}`} />
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 text-gray-600">
        {rows?.map((row, rowIndex) => (
          <TableRow row={row} key={rowIndex} columns={columns} collapsed={collapsed} />
        ))}
      </tbody>
    </table>
  );
};

export default Table;
