/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import classnames from "classnames";
import { motion } from "framer-motion";
import { Control, Controller, useController, useForm } from "react-hook-form";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import { debounce, isEqual, objectToParams } from "../../utils";
import { get } from "../../../library/apiService";
import { toast } from "react-toastify";
import UnderlineInput from "../Input/UnderlineInput";

interface SelectProps {
  label?: string;
  name: string;
  placeholder?: string;
  keyValue?: string;
  keyText?: string;
  control?: Control<any>;
  renderValue?: any;
  renderOptionValue?: any;
  className?: string;
  searchEndpoint?: string;
  limit?: string | number;
}

const Select = ({
  label,
  name,
  placeholder,
  keyValue,
  keyText,
  className,
  renderValue,
  renderOptionValue,
  control,
  searchEndpoint,
  limit,
}: SelectProps) => {
  const [options, setOptions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>();

  const { control: searchControl, watch } = useForm({
    defaultValues: {
      inputSearch: "",
    },
  });

  const { inputSearch } = watch();

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

  const renderValueOptions = value => {
    if (!value) return false;

    if (renderValue) return renderValue(value);

    return value[keyText];
  };

  const handleChangeOption = (option, onChangeCallback) => {
    onChangeCallback(option);
    setOpenDropdown(false);
  };

  const renderOptions = (value, option) => (
    <span className={classnames("text-gray-500", { "text-sky-600": option[keyValue] === value })}>
      {renderOptionValue ? renderOptionValue(option) : option[keyText]}
    </span>
  );

  useEffect(() => {
    debounce(() => {
      if (inputSearch?.length >= 5)
        return get(searchEndpoint, objectToParams({ rows: limit, page: "1", search: inputSearch }))
          .then(response => {
            const { data } = response?.data;

            if (data?.length === 0) return toast.error("Not found!");
            else {
              setOptions(data);
              setOpenDropdown(true);
            }
          })
          .catch(({ errorMessage }) => toast.error(errorMessage));
      else if (!inputSearch) {
        if (options?.length > 0) setOptions([]);
      }
    }, 2000);
  }, [inputSearch]);

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
              className="w-full flex justify-between cursor-pointer mt-1 px-3 py-2 border shadow-sm border-slate-300 bg-white focus:ring-4 focus:outline-none focus:ring-sky-300 rounded-md text-sm text-center items-center"
              onClick={() => setOpenDropdown(!openDropdown)}
            >
              <span className={classnames({ "text-slate-400": !value[keyText] }, "text-xs sm:text-sm text-gray-500")}>
                {renderValueOptions(value) || placeholder}
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
                  <li className="block rounded p-2 pt-0">
                    <UnderlineInput
                      name="inputSearch"
                      type="search"
                      control={searchControl}
                      className="[&_input]:py-2"
                      placeholder="Search..."
                    />
                  </li>
                  {options?.length > 0 &&
                    options.map(option => (
                      <li
                        key={`${option[keyText]}-${option[keyValue]}`}
                        onClick={() => handleChangeOption(option, onChange)}
                        className={classnames(
                          "block cursor-pointer p-2 rounded",
                          isEqual(option[keyText], value) ? "bg-sky-100" : "hover:bg-sky-50"
                        )}
                      >
                        {renderOptions(value, option)}
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

export default Select;
