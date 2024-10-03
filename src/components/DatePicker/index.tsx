import React from "react";
import { Control, Controller } from "react-hook-form";
import DatePicker from "react-datepicker";
import classnames from "classnames";
import "react-datepicker/dist/react-datepicker.css";

interface DatePickerProps extends DatePicker {
  name: string;
  label?: string;
  control: Control<any>;
  className?: string;
  dateFormat?: string;
  placeholder?: string;
}

const CustomHeader = ({ date, decreaseMonth, increaseMonth }) => {
  return (
    <div className="flex justify-between items-center px-4 py-2 text-sm font-medium text-gray-600">
      <div onClick={decreaseMonth} className="cursor-pointer">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
      <div>{date.toLocaleString("default", { month: "long", year: "numeric" })}</div>
      <div onClick={increaseMonth} className="cursor-pointer">
        <svg className="w-4 h-4 rotate-180" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const Datepicker = ({ name, label, control, dateFormat, className, placeholder, ...rest }: DatePickerProps) => {
  return (
    <div className={classnames("w-full", className)}>
      <label htmlFor={name} className="text-gray-500 text-md">
        {label}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <DatePicker
              {...field}
              dateFormat={dateFormat || "dd MMM yyyy"}
              selected={field.value ? new Date(field.value) : null}
              className={classnames(
                {
                  "border border-red-500": error,
                },
                "w-full block mt-1 bg-white px-3 py-2",
                "border shadow-sm border-slate-300",
                "placeholder-slate-400 placeholder:text-xs sm:placeholder:text-sm",
                "focus:outline-none focus:border-sky-500 focus:ring-sky-500",
                "block w-full rounded-md text-xs sm:text-sm focus:ring-1",
                "disabled:bg-gray-100 disabled:text-gray-500"
              )}
              popperClassName="drop-shadow-lg [&_.react-datepicker]:border-none"
              renderCustomHeader={CustomHeader}
              placeholderText={placeholder}
              {...rest}
            />
            {error && <span className="mt-1 line-2 text-red-500 text-xs">{error.message}</span>}
          </div>
        )}
      />
    </div>
  );
};

export default Datepicker;
