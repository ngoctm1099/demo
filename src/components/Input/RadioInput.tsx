import React, { useRef } from "react";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface RadioInputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  control?: Control<any>;
  className?: string;
}

const RadioInput = ({ label, type, name, placeholder, className, control, ...rest }: RadioInputProps) => {
  return (
    <div className={className}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div className="relative z-0">
            <div className="flex gap-2 items-center">
              <input
                type="radio"
                name={name}
                value={value}
                onChange={onChange}
                className={classnames(
                  {
                    "border border-red-500": error,
                  },
                  "w-4 h-4 text-green-600 bg-gray-100 border-gray-300"
                )}
                placeholder={placeholder}
                {...rest}
              />
              {label && (
                <label htmlFor={name} className="text-gray-500 text-md mb-1">
                  {label}
                </label>
              )}
            </div>
            {error && <p className="absolute line-2 text-red-600 dark:text-red-500 text-xs">{error?.message}</p>}
          </div>
        )}
      />
    </div>
  );
};

export default RadioInput;
