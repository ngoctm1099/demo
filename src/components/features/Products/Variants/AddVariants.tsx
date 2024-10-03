/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { AiOutlinePlus } from "react-icons/ai";
import Button from "../../../Button";
import Card from "../../../Card";
import Checkbox from "../../../Checkbox";
import Variants from "../../../Form/Variants";
import Input from "../../../Input";
import { toLocales } from "../../../../utils/string";

interface AddVariantsProps {
  index: number;
  onRemove: any;
}

const AddVariants = ({ index, onRemove }: AddVariantsProps) => {
  const { control, setValue, getValues, watch } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: `variants[${index}].options` });

  const currentOption = watch("variants")[index]?.options;

  const applyImageForVariant = (checked: boolean) => {
    const currentVariants = getValues("variants");
    const currentOptions = getValues("variants")[index].options;
    const firstImage = currentOptions.find(({ image }) => image)?.image;
    let newOptions = [];

    if (checked) newOptions = currentOptions.map(opt => ({ ...opt, image: firstImage }));
    else newOptions = currentOptions.map((opt, ind) => ({ ...opt, image: ind === 0 ? firstImage : null }));

    currentVariants[index].options = newOptions;
    setValue("variants", currentVariants);
  };

  useEffect(() => {
    if (currentOption?.length === 0) onRemove();
  }, [currentOption]);

  return (
    <Card
      key={index}
      header={
        <div className="flex gap-4 items-center">
          <Input
            name={`variants[${index}].name`}
            control={control}
            className="font-normal capitalize"
            placeholder={toLocales("fe_add_variants_enter_name")}
          />
          <Button
            title={<AiOutlinePlus size="1.4em" />}
            className="text-gray-500"
            onClick={() => append({ image: null, name: "", price: "" })}
          />
        </div>
      }
      onClose={onRemove}
    >
      <div className="flex flex-col gap-4">
        {fields.map((field, ind) => (
          <Variants key={field.id} variantIndex={index} optionIndex={ind} onDelete={() => remove(ind)} values={field} />
        ))}
      </div>
      {fields?.length > 1 && (
        <div className="mt-2 mb-1">
          <Checkbox
            name={`checkbox${index}`}
            control={control}
            label={toLocales("fe_add_variants_use_same_image")}
            onAfterClick={checked => applyImageForVariant(checked)}
          />
        </div>
      )}
    </Card>
  );
};

export default AddVariants;
