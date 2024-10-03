import React, { useRef } from "react";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface InputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  control?: Control<any>;
  className?: string;
  onAfterChange?: any;
  actionLabel?: string;
  onAction?: any;
  actionProps?: any;
  withRootClassname?: boolean;
  inputClassname?: string;
}

const Input = ({
  label,
  type,
  name,
  placeholder,
  className,
  control,
  onAfterChange,
  actionLabel,
  onAction,
  actionProps,
  withRootClassname,
  inputClassname,
  ...rest
}: InputProps) => {
  const inputRef = useRef();
  const valueProps = value => type !== "file" && { value };

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="text-gray-500 text-md mb-1 inline-block">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <>
            <div className="flex relative items-center z-0">
              <input
                type={type}
                name={name}
                {...valueProps(value)}
                onChange={e => {
                  if (type === "file")
                    return onChange({
                      target: {
                        value: e.target.files[0] || undefined,
                        name: e.target.files[0]?.name || "",
                      },
                    });
                  else if (onAfterChange) return onAfterChange(e, onChange);
                  return onChange(e);
                }}
                ref={inputRef}
                className={classnames(
                  !withRootClassname && [
                    {
                      "border border-red-500": error,
                      "px-3 py-2": type !== "file",
                    },
                    "w-full block bg-white",
                    "border shadow-sm border-slate-300 text-gray-500",
                    "placeholder-slate-400 placeholder:text-xs sm:placeholder:text-sm",
                    "focus:outline-none focus:border-sky-500 focus:ring-sky-500",
                    "block w-full rounded-md text-xs sm:text-sm focus:ring-1",
                    "file:cursor-pointer file:bg-gray-600 file:mr-3 file:text-white file:border-0 file:px-3 file:py-2",
                    "disabled:bg-gray-100 disabled:text-gray-500",
                  ],
                  inputClassname
                )}
                placeholder={placeholder}
                {...rest}
              />
              {actionLabel && (
                <>
                  <div className="h-5 absolute right-20 w-[1px] bg-gray-300"></div>
                  <button
                    className={classnames(
                      value ? "text-sky-600" : "text-gray-400",
                      "right-4 absolute cursor-pointer disabled:text-gray-400 disabled:cursor-auto"
                    )}
                    disabled={!onAction}
                    onClick={e => {
                      e.preventDefault();
                      onAction();
                    }}
                    {...actionProps}
                  >
                    {actionLabel}
                  </button>
                </>
              )}
            </div>
            {error && <p className="absolute line-2 text-red-600 dark:text-red-500 text-xs">{error?.message}</p>}
          </>
        )}
      />
    </div>
  );
};

export default Input;
