import React, { useState } from "react";
import classnames from "classnames";
import { AnimatePresence, motion } from "framer-motion";

interface TooltipProps {
  tooltipData: string | React.ReactNode;
  children: string | React.ReactNode;
  className?: string;
}

const Tooltip = ({ tooltipData, children, className }: TooltipProps) => {
  const [isShown, setIsShown] = useState(false);
  return (
    <div className={classnames("inline-block", className)}>
      <div onMouseEnter={() => setIsShown(true)} onMouseLeave={() => setIsShown(false)}>
        {children}
        <AnimatePresence>
          {isShown && (
            <motion.div
              className="absolute transform transition-all duration-150"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.01 }}
            >
              <div className="bg-gray-500 opacity-75 text-white rounded-md px-2 py-1 text-xs">{tooltipData}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tooltip;
