import React from "react";
import classnames from "classnames";
import Button from "../Button";
import Image from "next/image";

interface ProductCardProps {
  data?: any;
  className?: string;
  onClick?: any;
  defaultCurrency?: string;
}

const ProductCard = ({ data, className, onClick, defaultCurrency }: ProductCardProps) => {
  return (
    <div className={classnames("bg-white rounded-lg drop-shadow-md", className)}>
      <div className="flex items-center">
        <div
          className={classnames(
            "w-24 h-24 overflow-hidde relative flex items-center justify-center",
            data?.product?.imageBlob && "bg-slate-100"
          )}
        >
          {data?.product?.imageBlob && (
            <Image src={data?.product?.imageBlob} fill sizes="100vw" className="rounded-l-lg" alt="product-image" />
          )}
        </div>
        <div className="flex flex-col grow justify-between h-full p-2.5">
          <div>
            <p className="text-base font-medium tracking-tight text-gray-600">{data?.product?.name}</p>
            <p className="font-light text-xs">{data?.product?.description}</p>
          </div>
          <div className="flex justify-between w-full items-end">
            <p className="text-sm w-full font-light text-gray-500">
              {defaultCurrency} <span className="text-sky-700 font-normal">{data?.product?.price.toFixed(2)}</span>
            </p>
            <Button
              title="Add"
              onClick={onClick}
              className="px-4 py-2 text-sm text-center text-white bg-sky-700 rounded-md shadow-md hover:bg-sky-700 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
