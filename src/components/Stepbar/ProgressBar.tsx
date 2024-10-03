import React from "react";
import classnames from "classnames";

interface ProgressBarProps {
  progressWidth?: string;
  width?: string;
  color?: string;
  className?: string;
}

const ProgressBar = ({ progressWidth, width, className, color }: ProgressBarProps) => {
  return (
    <div className={classnames("align-center items-center align-middle content-center flex", width, className)}>
      <div className="w-full bg-gray-100 rounded items-center align-middle align-center flex-1">
        <div
          className={classnames(
            "text-xs leading-none h-1 text-center text-gray-darkest rounded",
            color || "bg-green-300"
          )}
          style={{ width: progressWidth }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
