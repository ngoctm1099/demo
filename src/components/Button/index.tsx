import React from "react";
import classnames from "classnames";

interface ButtonProps {
  className?: string;
  disabled?: boolean;
  onClick?: any;
  size?: string | number;
  title?: JSX.Element | JSX.Element[] | string;
}

const Button = ({ className, disabled, size, onClick, title }: ButtonProps) => {
  return (
    <button
      className={classnames(
        className,
        "transition duration-200 ease-in-out disabled:opacity-50 disabled:bg-gray-100 disabled:border-gray-400 disabled:text-gray-600 flex justify-center items-center"
      )}
      disabled={disabled}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

export default Button;
