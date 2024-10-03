import React, { useRef, useState } from "react";
import classnames from "classnames";
import { motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";
import { MdOutlineCheck } from "react-icons/md";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import { isEqual, sortArrayByObjectKey } from "../../utils";

interface SelectProps {
  label?: string;
  name: string;
  placeholder?: string;
  options: any[];
  keyValue?: string;
  keyText?: string;
  control?: Control<any>;
  className?: string;
  multiple?: boolean;
  onChangeCallback?: () => void;
}

const Select = ({
  label,
  name,
  placeholder,
  options,
  keyValue,
  keyText,
  className,
  control,
  multiple,
  onChangeCallback,
}: SelectProps) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>();

  const variants = {
    closed: { opacity: 0, scaleY: 0, transition: { duration: 0.1 } },
    open: {
      opacity: 1,
      scaleY: 1,
      transition: {
        duration: 0.15,
      },
    },
  };

  const handleChangeOption = (value, option, onChange) => {
    if (multiple) {
      if (value?.find(v => isEqual(v, option[keyValue]))) {
        onChange(value.filter(v => !isEqual(v, option[keyValue])));
        onChangeCallback?.();
      } else {
        const newValue = value || [];
        newValue.push(option[keyValue]);
        onChange([...sortArrayByObjectKey(newValue, keyText)]);
        onChangeCallback?.();
      }
    } else {
      onChange(option[keyValue]);
      setOpenDropdown(false);
      onChangeCallback?.();
    }
  };

  const renderValue = value => {
    if (!value || value?.length === 0) return placeholder;
    if (Array.isArray(value))
      return options
        .filter(opt => value.includes(opt[keyValue]))
        .map(o => o[keyText])
        .join(", ");
    return options.find(o => o[keyValue] === value)[keyText];
  };

  const renderOption = (value, option) => (
    <span className="inline-flex gap-2">
      <MdOutlineCheck
        size="1.2em"
        className={classnames({
          hidden: !multiple,
          "text-gray-200": multiple && !value?.find(v => isEqual(v, option[keyValue])),
          "text-sky-600": multiple && value?.find(v => isEqual(v, option[keyValue])),
        })}
      />
      {option[keyText]}
    </span>
  );

  useBackgroundClick(dropdownRef, openDropdown, setOpenDropdown);

  return (
    <div className={classnames(className)}>
      <label htmlFor={name} className="text-gray-500 text-md">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div>
            <div
              className="w-full flex justify-between gap-1.5 cursor-pointer mt-1 px-3 py-2 border shadow-sm border-slate-300 bg-white focus:ring-4 focus:outline-none focus:ring-sky-300 rounded-md text-sm text-center items-center"
              onClick={() => setOpenDropdown(!openDropdown)}
              id="select-text"
            >
              <span
                className={classnames(
                  { "text-slate-400": !value || value?.length === 0 },
                  "text-xs sm:text-sm text-gray-500"
                )}
              >
                {renderValue(value)}
              </span>
              <span
                className={classnames("w-4 h-4 text-gray-600 transition duration-150", openDropdown && "rotate-180")}
              >
                <svg
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </span>
            </div>
            <div id="dropdown" className="relative z-10">
              {openDropdown && <div className="fixed inset-0 transition-opacity"></div>}
              <motion.div
                className={classnames("mt-1 bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 w-full")}
                animate={openDropdown ? "open" : "closed"}
                variants={variants}
                ref={dropdownRef}
              >
                <ul className="absolute w-full drop-shadow-lg p-2 bg-white rounded-lg text-xs sm:text-sm text-gray-500 dark:text-gray-200">
                  {options.map(option => (
                    <li
                      key={`${option[keyText]}-${option[keyValue]}`}
                      onClick={() => handleChangeOption(value, option, onChange)}
                      className={classnames(
                        "block cursor-pointer p-2 rounded",
                        isEqual(option[keyText], value) ? "bg-sky-100" : "hover:bg-sky-50"
                      )}
                    >
                      {renderOption(value, option)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            {error && <span className="mt-1 line-2 text-red-600 dark:text-red-500 text-xs">{error?.message}</span>}
          </div>
        )}
      />
    </div>
  );
};

export default Select;
