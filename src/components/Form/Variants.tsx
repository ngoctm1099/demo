/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import classnames from "classnames";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { AiOutlineDelete } from "react-icons/ai";
import { convertKeyToImage } from "../../utils/s3File";
import Button from "../Button";
import Input from "../Input";
import { toLocales } from "../../utils/string";

interface VariantsProps {
  variantIndex: number;
  optionIndex: number;
  values?: any;
  onDelete?: any;
}

const Variants = ({ variantIndex, optionIndex, values, onDelete }: VariantsProps) => {
  const { control, watch, setValue } = useFormContext();
  const [optionImage, setOptionImage] = useState<any>();

  const image = watch(`variants[${variantIndex}].options[${optionIndex}].image`);

  useEffect(() => {
    convertKeyToImage(image)
      .then(res => setOptionImage(res))
      .catch(err => {});
  }, [image]);

  useEffect(() => {
    if (values) {
      for (let x in values) {
        if (values[x]) {
          setValue(`variants[${variantIndex}].options[${optionIndex}].${x}`, values[x]);
        }
      }
    }
  }, [values]);

  return (
    <div className="flex justify-between gap-4 items-center h-full">
      <div
        className={classnames("flex justify-center items-center text-center rounded-lg w-20 h-20", {
          "border border-gray-300": !optionImage,
        })}
      >
        {optionImage ? (
          <div className="relative w-20 h-20">
            <Image src={optionImage} className="block rounded-lg drop-shadow" alt="image" fill />
          </div>
        ) : (
          <span className="text-gray-400 px-6 mt-1 text-xs">{toLocales("fe_product_id_mid_no_image")}</span>
        )}
      </div>
      <div className="w-full flex flex-col gap-2">
        <Input type="file" name={`variants[${variantIndex}].options[${optionIndex}].image`} control={control} />
        <div className="flex justify-between gap-4">
          <Input
            type="text"
            name={`variants[${variantIndex}].options[${optionIndex}].name`}
            placeholder={toLocales("fe_variants_enter_option")}
            control={control}
            className="flex-[3]"
          />
          <Input
            type="text"
            name={`variants[${variantIndex}].options[${optionIndex}].price`}
            placeholder={toLocales("fe_variants_enter_price")}
            control={control}
            className="flex-[2]"
          />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-2">
        <Button
          title={
            <AiOutlineDelete
              className="w-9 h-9 p-2 rounded-md border border-rose-400 bg-rose-50 text-rose-600 hover:border-rose-500 hover:bg-rose-100 hover:text-rose-700 transition"
              size="2em"
            />
          }
          onClick={onDelete}
        />
      </div>
    </div>
  );
};

export default Variants;
