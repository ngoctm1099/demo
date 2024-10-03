import React from "react";
import classnames from "classnames";
import Button from "../Button";
import { IconContext } from "react-icons/lib";

interface ColorCardProps {
  icon?: React.ReactNode;
  title?: string;
  points?: number | string;
  color?: string;
  IconProps?: any;
  className?: string;
  onClose?: any;
  hideCloseBtn?: boolean;
}

const ColorCard = ({ icon, title, points, color, IconProps, className, onClose, hideCloseBtn }: ColorCardProps) => {
  return (
    <div
      className={classnames(
        "flex justify-between items-center relative overflow-hidden p-4 pr-16 shadow-md text-white rounded-lg",
        color,
        className
      )}
    >
      <div className="flex flex-col gap-4 justify-between">
        <p className="text-base sm:text-xl font-semibold leading-2 uppercase">{title}</p>
        <p className="text-sm sm:text-base">{points}</p>
      </div>
      <IconContext.Provider value={IconProps}>{icon}</IconContext.Provider>
      {!hideCloseBtn && (
        <Button
          onClick={onClose}
          className="text-gray-700 text-opacity-25 absolute right-2 top-2 bg-gray-50 bg-opacity-50 hover:bg-gray-100 hover:shadow-md hover:text-gray-500 transition duration-300 rounded-full text-sm p-1 inline-flex items-center"
          title={
            <svg
              aria-hidden="true"
              className="w-3 h-3"
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
  );
};

export default ColorCard;
