import React from "react";
import classnames from "classnames";
import { Control, Controller } from "react-hook-form";

interface CheckboxProps {
  className?: string;
  minus?: boolean;
  color?: string;
  label?: string;
  name: string;
  control?: Control;
  disabled?: boolean;
  onAfterClick?: any;
}

const Checkbox = ({ className, minus, name, label, control, disabled, onAfterClick, color }: CheckboxProps) => (
  <Controller
    control={control}
    name={name}
    render={({ field: { onChange, value, ref } }) => (
      <div className={classnames("flex items-center", className)}>
        <input
          type="checkbox"
          checked={value || false}
          name={name}
          onChange={e => {
            onChange(e);
            onAfterClick && onAfterClick(e.target.checked, name);
          }}
          ref={ref}
          disabled={disabled}
          className={classnames(
            "appearance-none bg-gray-50 w-4 h-4 border border-gray-300 cursor-pointer rounded focus:ring-sky-600 transition duration-100",
            minus && "minus-sign",
            color || "checked:bg-sky-600 checked:border-sky-600"
          )}
        />
        {label && (
          <label htmlFor="default-checkbox" className="ml-2 text-sm text-gray-500 dark:text-gray-300">
            {label}
          </label>
        )}
      </div>
    )}
  />
);

export default Checkbox;
