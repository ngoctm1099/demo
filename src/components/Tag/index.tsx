import React from "react";
import { IoCloseOutline } from "react-icons/io5";

const Tag = ({ value, onCloseTag }) => {
  const handleCloseTag = e => {
    e.stopPropagation();
    if (onCloseTag) onCloseTag();
  };

  return (
    <span
      className="inline-flex items-center bg-gray-200 pl-2 pr-1 py-1 rounded-[3px] cursor-default"
      onClick={e => e.stopPropagation()}
    >
      <span>{value}</span>
      <span onClick={handleCloseTag} className="cursor-pointer">
        <IoCloseOutline size="1.5em" />
      </span>
    </span>
  );
};

export default Tag;
