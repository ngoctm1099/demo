import React, { useRef, useState } from "react";
import classnames from "classnames";
import { motion } from "framer-motion";
import { Controller, useController, useFormContext } from "react-hook-form";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import { sortArrayString } from "../../utils";
import SelectItem from "./SelectItem";
import Tag from "../Tag";

interface SelectDropdownProps {
  label?: string;
  name: string;
  placeholder?: string;
  options: any[];
  className?: string;
}

const SelectDropdown = ({ label, name, placeholder, options, className }: SelectDropdownProps) => {
  const [data, setData] = useState(options);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>();
  const { control, setValue } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name, control });

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

  const handleChangeOption = (checked, option) => {
    if (checked) onChange(value ? sortArrayString([...new Set(value.concat(option))]) : [option]);
    else onChange(value.filter(v => v !== option));
  };

  const handleRemoveTag = selectedValue => {
    onChange(value?.filter(v => v !== selectedValue));

    data.forEach(item => {
      item?.subitems?.forEach((subIt, subItIndex) => {
        if (subIt?.label === selectedValue) setValue(`${subIt?.label}-${subItIndex}`, false);
      });
    });
  };

  const handleExpandItem = index => {
    setData([...data.map((dt, ind) => (ind === index ? { ...dt, expand: !dt.expand } : dt))]);
  };

  const renderValue = value => {
    if (!value || value?.length === 0) return placeholder;

    return (
      <span className="flex gap-1 overflow-hidden">
        {value.map(val => (
          <Tag value={val} key={val} onCloseTag={() => handleRemoveTag(val)} />
        ))}
      </span>
    );
  };

  const renderOption = (option, optionIndex) => (
    <SelectItem
      option={option}
      value={value}
      onChange={onChange}
      index={optionIndex}
      onClickExpand={() => handleExpandItem(optionIndex)}
      onClickCheckbox={(checked, item) => handleChangeOption(checked, item)}
    />
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
        render={({ fieldState: { error } }) => (
          <div>
            <div
              className={classnames(
                "w-full flex justify-between mt-1 cursor-pointer h-10",
                "border shadow-sm border-slate-300 bg-white focus:ring-4 focus:outline-none",
                "px-3 focus:ring-blue-300 rounded-md text-sm text-center items-center",
                value && value?.length > 0 ? "py-1 pl-1" : "py-2"
              )}
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <span
                className={classnames(
                  { "text-slate-400": !value || value?.length === 0 },
                  "text-xs sm:text-sm text-gray-600 max-w-[95%]"
                )}
              >
                {renderValue(value)}
              </span>
              <span
                className={classnames(
                  "w-4 h-4 bg-white z-5 text-gray-500 transition duration-150",
                  openDropdown && "rotate-180"
                )}
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
            <div id="dropdown" className="relative">
              {openDropdown && <div className="fixed inset-0 transition-opacity"></div>}
              <motion.div
                className={classnames("mt-1 bg-white divide-y divide-gray-100 shadow dark:bg-gray-700 w-full")}
                animate={openDropdown ? "open" : "closed"}
                variants={variants}
                ref={dropdownRef}
              >
                <ul className="absolute z-11 w-full drop-shadow-lg p-2 bg-white rounded-lg text-xs sm:text-sm text-gray-600 dark:text-gray-200">
                  {data.map((option, optionIndex) => (
                    <li key={`${option?.label}-${optionIndex}`} className="p-1">
                      {renderOption(option, optionIndex)}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </div>
            {<span className="mt-1 line-2 text-red-600 dark:text-red-500 text-xs">{error && error?.message}</span>}
          </div>
        )}
      />
    </div>
  );
};

export default SelectDropdown;
