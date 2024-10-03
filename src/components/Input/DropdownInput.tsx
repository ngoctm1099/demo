/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { Control, Controller, useController } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";

interface DropdownInputProps extends React.HTMLProps<HTMLInputElement> {
  label?: string;
  type?: string;
  name: string;
  options?: any;
  keyOption?: string;
  defaultOption?: any;
  renderOptions?: any;
  placeholder?: string;
  control?: Control<any>;
  className?: string;
  onAfterChange?: any;
}

const DropdownInput = ({
  label,
  type,
  name,
  placeholder,
  options,
  keyOption,
  defaultOption,
  renderOptions,
  className,
  control,
  onAfterChange,
  ...rest
}: DropdownInputProps) => {
  const dropdownRef = useRef();
  const [selectedOption, setSelectedOption] = useState(defaultOption);
  const [openDropdown, setOpenDropdown] = useState(false);

  const {
    field: { onChange: onChangeCb, value: valueInput },
  } = useController({ name, control });

  const handleSelectOption = option => {
    setSelectedOption(option);
    onChangeCb({ ...valueInput, option });
    setOpenDropdown(false);
  };

  useEffect(() => {
    onChangeCb({ ...valueInput, option: defaultOption });
  }, [defaultOption]);

  useBackgroundClick(dropdownRef, openDropdown, setOpenDropdown);

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
            <div className="flex relative justify-between">
              <div>
                <button
                  className="shadow-sm z-10 flex justify-between gap-1.5 items-center p-2 pl-3 text-xs sm:text-sm min-w-max text-gray-500 bg-slate-50 border border-r-0 border-slate-300 rounded-l-lg"
                  onClick={() => setOpenDropdown(!openDropdown)}
                >
                  {selectedOption ? renderOptions && renderOptions(selectedOption) : ""}
                  <svg
                    aria-hidden="true"
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </button>
              </div>
              <div className="w-full">
                <input
                  type="text"
                  id="search-dropdown"
                  name={name}
                  value={value?.input}
                  onChange={e => onChange({ ...value, input: e.target.value })}
                  className={classnames(
                    {
                      "border border-red-500": error,
                    },
                    "w-full block bg-white px-3 py-2",
                    "border shadow-sm border-slate-300 text-gray-500",
                    "placeholder-slate-400 placeholder:text-xs sm:placeholder:text-sm",
                    "focus:outline-none focus:border-sky-500 focus:ring-sky-500",
                    "block w-full rounded-r-md text-xs sm:text-sm focus:ring-1",
                    "disabled:bg-gray-100 disabled:text-gray-500"
                  )}
                  placeholder={placeholder}
                  {...rest}
                />
              </div>
            </div>
            <AnimatePresence>
              {openDropdown && (
                <div className="">
                  <div className="fixed inset-0 transition-opacity z-10"></div>
                  <motion.div
                    animate={openDropdown ? "open" : "closed"}
                    initial={{ opacity: 0, scaleY: 0 }}
                    variants={{
                      closed: { opacity: 0, scaleY: 0, transition: { duration: 0.1 } },
                      open: {
                        opacity: 1,
                        scaleY: 1,
                        transition: {
                          duration: 0.15,
                        },
                      },
                    }}
                    exit={{ opacity: 0, scaleY: 0 }}
                    ref={dropdownRef}
                    id="dropdown"
                    className="relative z-20 divide-y divide-gray-100 drop-shadow dark:bg-gray-700"
                  >
                    <ul className="absolute mt-1.5 overflow-y-auto max-h-[30vh] bg-white shadow rounded-lg p-1.5 sm:p-2 text-xs sm:text-sm text-gray-500">
                      {options?.map((option, index) => (
                        <li key={index} className="inline-block w-full">
                          <button
                            type="button"
                            onClick={() => handleSelectOption(option)}
                            className="inline-flex text-center w-full rounded p-2 hover:bg-slate-100"
                          >
                            {renderOptions ? renderOptions(option) : option}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>

            {error && <p className="absolute line-2 text-red-600 dark:text-red-500 text-xs">{error?.message}</p>}
          </>
        )}
      />
    </div>
  );
};

export default DropdownInput;
