import React from "react";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface ToggleProps {
  label?: string;
  name: string;
  control?: Control<any>;
  className?: string;
}

const Toggle = ({ label, name, className, control }: ToggleProps) => {
  return (
    <div className={classnames("flex justify-between items-center", className)}>
      <label htmlFor={name} className="text-gray-500 text-md">
        {label}
      </label>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value, ref } }) => (
          <div className="relative ">
            <input type="checkbox" className="sr-only peer" checked={value} name={name} onChange={onChange} ref={ref} />
            <div
              className={classnames(
                "w-10 h-6 sm:w-14 sm:h-8 cursor-pointer bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-sky-300 rounded-full peer after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 sm:after:h-7 sm:after:w-7 after:transition-all",
                {
                  "peer-checked:after:translate-x-[85%] peer-checked:after:border-white peer-checked:bg-sky-600": value,
                }
              )}
              onClick={() => onChange(!value)}
            ></div>
          </div>
        )}
      />
    </div>
  );
};

export default Toggle;
