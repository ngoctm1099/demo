import React, { useEffect, useState } from "react";
import { FaChevronRight } from "react-icons/fa";
import classnames from "classnames";
import generateRow from "./generateRow";
import { AnimatePresence, motion } from "framer-motion";

const TableRow = ({ row, columns, collapsed }) => {
  const [isExpand, setIsExpand] = useState(false);

  useEffect(() => {
    setIsExpand(false);
  }, [row]);

  return (
    <>
      <tr className={classnames("hover:bg-slate-50", isExpand && "bg-slate-50")}>
        {collapsed && (
          <td className="text-center p-2 cursor-pointer h-full" onClick={() => setIsExpand(!isExpand)}>
            <div className={classnames("transition duration-150 w-fit", isExpand && "rotate-90")}>
              <FaChevronRight />
            </div>
          </td>
        )}
        {columns.map((column, colIndex) => generateRow(row, column, colIndex))}
      </tr>
      <AnimatePresence>
        {isExpand && row?.renderCollapse && (
          <tr>
            <td colSpan={columns?.length + 1}>
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: isExpand ? "auto" : 0, opacity: isExpand ? 1 : 0 }}
                exit={{ height: 0, opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                {row.renderCollapse()}
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

export default TableRow;
