import React, { useRef } from "react";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface UnderlineInputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  control?: Control<any>;
  className?: string;
  inputClassName?: string;
  actionLabel?: string;
  actionProps?: any;
  onAction?: any;
}

const UnderlineInput = ({
  label,
  type,
  name,
  placeholder,
  className,
  inputClassName,
  control,
  actionLabel,
  actionProps,
  onAction,
  ...rest
}: UnderlineInputProps) => {
  const inputRef = useRef();

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="text-gray-500 text-md mb-1">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <div className="flex relative z-0">
              <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                ref={inputRef}
                className={classnames(
                  {
                    "border border-red-500": error,
                  },
                  "w-full block bg-white",
                  "border-b-[1px] border-gray-200 text-gray-500 py-0.5",
                  "placeholder-slate-400 placeholder:text-xs sm:placeholder:text-sm",
                  "focus:outline-none focus:border-gray-300",
                  "block w-full text-xs sm:text-sm",
                  "disabled:text-gray-400"
                )}
                placeholder={placeholder}
                {...rest}
              />
              {actionLabel && (
                <button
                  className={classnames(
                    value ? "text-sky-600" : "text-gray-400",
                    "right-0 absolute cursor-pointer disabled:text-gray-400 disabled:cursor-auto"
                  )}
                  onClick={onAction}
                  disabled={!value}
                  {...actionProps}
                >
                  {actionLabel}
                </button>
              )}
            </div>
            {error && <p className="mt-1 line-2 text-red-600 dark:text-red-500 text-xs">{error?.message}</p>}
          </>
        )}
      />
    </div>
  );
};

export default UnderlineInput;
