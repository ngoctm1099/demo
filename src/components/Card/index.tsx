import classnames from "classnames";
import React from "react";
import Button from "../Button";

interface CardProps {
  header?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  onClose?: any;
  hideCloseBtn?: boolean;
}

const index = ({ header, className, children, onClose, hideCloseBtn }: CardProps) => {
  return (
    <div className={classnames("border border-gray-200 rounded-lg h-full", className)}>
      <div className="flex justify-between items-center px-4 py-3 bg-gray-50 rounded-t-lg">
        <div className="uppercase font-semibold text-gray-600 text-sm sm:text-md">{header}</div>
        {!hideCloseBtn && (
          <Button
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            title={
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            }
          />
        )}
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
};

export default index;
