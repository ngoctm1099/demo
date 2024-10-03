import React, { useRef, useState } from "react";
import classnames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import { Control, Controller } from "react-hook-form";
import { MdOutlineCheck } from "react-icons/md";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import { isEqual, sortArrayByObjectKey } from "../../utils";

interface UnderlineSelectProps {
  label?: string;
  name: string;
  placeholder?: string;
  options: any[];
  keyValue?: string;
  keyText?: string;
  control?: Control<any>;
  className?: string;
  multiple?: boolean;
}

const UnderlineSelect = ({
  label,
  name,
  placeholder,
  options,
  keyValue,
  keyText,
  className,
  control,
  multiple,
}: UnderlineSelectProps) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>();

  const handleChangeOption = (value, option, onChangeCallback) => {
    if (multiple) {
      if (value?.find(v => isEqual(v, option[keyValue])))
        onChangeCallback(value.filter(v => !isEqual(v, option[keyValue])));
      else {
        const newValue = value || [];
        newValue.push(option[keyValue]);
        onChangeCallback([...sortArrayByObjectKey(newValue, keyText)]);
      }
    } else {
      onChangeCallback(option[keyValue]);
      setOpenDropdown(false);
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
      {label && (
        <label htmlFor={name} className="text-gray-500 text-md mb-1">
          {label}
        </label>
      )}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <div className="z-10 relative">
            <div
              className={classnames(
                "border-slate-300",
                "w-full flex flex-row-reverse justify-between py-px",
                "cursor-pointer border-b-[1px] bg-white",
                "focus:outline-none text-sm text-center items-center"
              )}
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <span
                className={classnames(
                  { "text-slate-400": !value || value?.length === 0 },
                  "text-xs sm:text-sm text-gray-600"
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
            <AnimatePresence>
              {openDropdown && (
                <div id="dropdown" className="relative">
                  <div className="fixed inset-0 transition-opacity"></div>
                  <motion.div
                    className={classnames("bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 w-full")}
                    initial={{ opacity: 0.5, scaleY: 0 }}
                    animate={{ opacity: 1, scaleY: 1 }}
                    exit={{ opacity: 0, scaleY: 0, transition: { duration: 0.1 } }}
                    ref={dropdownRef}
                  >
                    <ul className="absolute w-full rounded-b bg-white shadow-md text-xs sm:text-sm text-gray-600 dark:text-gray-200">
                      {options.map(option => (
                        <li
                          key={`${option[keyText]}-${option[keyValue]}`}
                          onClick={() => handleChangeOption(value, option, onChange)}
                          className={classnames(
                            "block cursor-pointer p-2",
                            isEqual(option[keyText], value) ? "bg-slate-100" : "hover:bg-slate-50"
                          )}
                        >
                          {renderOption(value, option)}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
            {<span className="mt-1 line-2 text-red-600 dark:text-red-500 text-xs">{error && error?.message}</span>}
          </div>
        )}
      />
    </div>
  );
};

export default UnderlineSelect;
