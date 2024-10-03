/* eslint-disable react-hooks/exhaustive-deps */
import React from "react";
import { BsChevronDown } from "react-icons/bs";
import { motion } from "framer-motion";
import classnames from "classnames";
import Checkbox from "../Checkbox";
import { useFormContext } from "react-hook-form";

const SelectItem = ({ value, onChange, option, index, onClickCheckbox, onClickExpand }) => {
  const { control, setValue, watch } = useFormContext();

  const optionCheckboxName = `${option?.label}-${index}`;

  const selectedSubitems = option?.subitems?.filter(({ label }) => value?.includes(label));
  const isAllSelected = selectedSubitems?.length === option?.subitems?.length;
  const isSelected = selectedSubitems?.length > 0 && !isAllSelected;

  const handleSelectSubItem = (checked, label) => {
    const isSubitemChecked = option?.subitems?.find((subItem, subItemIndex) =>
      watch(`${subItem?.label}-${subItemIndex}`)
    );

    setValue(optionCheckboxName, !!isSubitemChecked);
    onClickCheckbox(checked, label);
  };

  const handleSelectAll = checked => {
    let allSubitems = value || [];
    const realCheckedState = isSelected ? true : checked;

    if (isSelected) setValue(optionCheckboxName, true);

    option?.subitems?.forEach((subItem, subItemIndex) => {
      setValue(`${subItem?.label}-${subItemIndex}`, realCheckedState);

      if (realCheckedState) {
        if (!value?.includes(subItem?.label)) allSubitems.push(subItem?.label);
      } else {
        if (value?.includes(subItem?.label)) allSubitems = allSubitems.filter(subIt => subIt !== subItem?.label);
      }
    });

    onChange(allSubitems);
  };

  const renderExpandedItems = opt =>
    opt?.subitems?.map((subIt, subItIndex) => {
      return (
        <div className="flex gap-2 items-center" key={subIt.label}>
          <Checkbox
            name={`${subIt?.label}-${subItIndex}`}
            onAfterClick={checked => handleSelectSubItem(checked, subIt?.label)}
            control={control}
          />
          {subIt?.label}
        </div>
      );
    });

  return (
    <div>
      <div className="flex gap-2 items-center">
        {option?.expand !== undefined ? (
          <span className="cursor-pointer" onClick={onClickExpand}>
            <BsChevronDown className={classnames(!option?.expand && "-rotate-90", "transition duration-150")} />
          </span>
        ) : (
          <span className="w-[14px]"></span>
        )}
        <Checkbox
          name={optionCheckboxName}
          control={control}
          minus={isSelected}
          onAfterClick={checked => handleSelectAll(checked)}
        />
        {option?.label}
      </div>
      <motion.div
        className={classnames("ml-8 !flex flex-col gap-1", option.expand ? "mt-2" : "hidden")}
        initial={{ height: 0, opacity: 0, overflow: "hidden" }}
        animate={{ height: option?.expand ? "auto" : 0, opacity: option?.expand ? 1 : 0, overflow: "hidden" }}
        transition={{ duration: 0.15 }}
      >
        {renderExpandedItems(option)}
      </motion.div>
    </div>
  );
};

export default SelectItem;
