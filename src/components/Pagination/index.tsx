/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Button from "../Button";
import classNames from "classnames";
import { RiArrowLeftSLine, RiArrowRightSLine } from "react-icons/ri";
import { RxDoubleArrowLeft, RxDoubleArrowRight } from "react-icons/rx";

interface PaginationProps {
  totalPage: number;
  currentPage: number;
  className?: string;
  rangePageIndex?: number;
  size?: string | number;
  setCurrentPage: (page: number) => void;
}

const Pagination = ({ totalPage, currentPage, className, rangePageIndex, size, setCurrentPage }: PaginationProps) => {
  const [pageIndexList, setPageIndexList] = useState([]);
  const nonActivePageIndex =
    "block p-2 sm:py-2 sm:px-3 leading-5 text-gray-500 bg-white rounded-full hover:bg-sky-50 disabled:bg-transparent";
  const activePageIndex = "z-10 p-2 sm:py-2 sm:px-3 leading-5 text-sky-600 bg-sky-100 hover:text-sky-700 rounded-full";

  const leftBtns = [
    {
      title: <RxDoubleArrowLeft />,
      disabled: currentPage === 1,
      onClick: () => setCurrentPage(1),
      className: "w-8 h-8 sm:w-10 sm:h-10",
    },
    {
      title: <RiArrowLeftSLine />,
      disabled: currentPage === 1,
      onClick: () => setCurrentPage(currentPage - 1),
      className: "w-8 h-8 sm:w-10 sm:h-10",
    },
  ];
  const rightBtns = [
    {
      title: <RiArrowRightSLine />,
      disabled: currentPage === totalPage,
      onClick: () => setCurrentPage(currentPage + 1),
      className: "w-8 h-8 sm:w-10 sm:h-10",
    },
    {
      title: <RxDoubleArrowRight />,
      disabled: currentPage === totalPage,
      onClick: () => setCurrentPage(totalPage),
      className: "w-8 h-8 sm:w-10 sm:h-10",
    },
  ];

  const renderPageIndex = () =>
    pageIndexList.map((pageIndex, index) => (
      <li key={`${pageIndex}-${index}`}>
        <Button
          className={classNames(
            pageIndex === currentPage ? activePageIndex : nonActivePageIndex,
            "text-xs sm:text-sm w-8 h-8 sm:w-10 sm:h-10"
          )}
          size={size}
          onClick={() => setCurrentPage(pageIndex)}
          title={pageIndex}
        />
      </li>
    ));

  const renderArrowBtns = btns =>
    btns.map((btn, index) => (
      <li key={`${btn.title}-${index}`}>
        <Button {...btn} size={size} className={classNames(btn?.className, nonActivePageIndex)} />
      </li>
    ));

  const generatePageIndexArr = (start: number, stop: number, step: number) =>
    Array.from({ length: (stop - start) / step + 1 }, (value, index) => start + index * step);

  useEffect(() => {
    let startIndex, stopIndex;
    if (currentPage - 1 <= 1) {
      startIndex = 1;
      stopIndex = rangePageIndex;
    } else if (currentPage + 1 >= totalPage) {
      startIndex = totalPage - (rangePageIndex - 1);
      stopIndex = totalPage;
    } else {
      startIndex = currentPage - 1;
      stopIndex = currentPage + 1;
    }
    setPageIndexList(generatePageIndexArr(startIndex, totalPage >= rangePageIndex ? stopIndex : totalPage, 1));
  }, [currentPage, totalPage]);

  return (
    <ul className={classNames("inline-flex items-top", className)}>
      {renderArrowBtns(leftBtns)}
      {renderPageIndex()}
      {renderArrowBtns(rightBtns)}
    </ul>
  );
};

export default Pagination;
