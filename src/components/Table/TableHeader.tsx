import classnames from "classnames";
import React from "react";

const TableHeader = ({ column }) => {
  return (
    <th style={{ ...column?.style }} className={classnames(column?.className, "p-2")}>
      {column.title}
    </th>
  );
};

export default TableHeader;
