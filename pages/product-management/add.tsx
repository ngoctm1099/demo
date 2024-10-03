import React from "react";
import classnames from "classnames";
import Image from "next/image";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";
import Button from "../../src/components/Button";
import AddVariants from "../../src/components/features/Products/Variants/AddVariants";
import Form from "../../src/components/Form";
import Input from "../../src/components/Input";
import { uploadFileToS3 } from "../../src/utils/s3File";
import { defaultVariant } from "../../src/constant/defaultValues";
import { post } from "../../library/apiService";
import addProductSchema from "../../src/components/features/Products/AddProduct/addProductSchema";
import { yupResolver } from "@hookform/resolvers/yup";
import { useRouter } from "next/router";
import { toLocales } from "../../src/utils/string";

const AddProduct = () => {
  const router = useRouter();
  const methods = useForm({
    resolver: yupResolver(addProductSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      file: null,
      name: "",
      categories: null,
      tags: null,
      price: "",
      description: "",
      variants: [defaultVariant],
    },
  });
  const { control, watch, handleSubmit } = methods;

  const { file } = watch();

  const fieldArrayMethods = useFieldArray({
    control,
    name: "variants",
  });

  const { fields, append, remove } = fieldArrayMethods;

  const handleAddProduct = async () => {
    const { file: f, ...data } = watch();

    const productImage = await handleUploadImage(f);
    let variantsWithImageKeys = [];

    const convertDataWithImageKey = async () => {
      const variants = data.variants.map(async ({ name, options }) => {
        let optionsWithImageKeys = [];
        const convertOptionsWithImageKey = async () => {
          const newOptions = options.map(async option => {
            const imageKey = await handleUploadImage(option.image);
            return { ...option, image: imageKey };
          });

          return await Promise.all(newOptions);
        };
        await convertOptionsWithImageKey().then(data => (optionsWithImageKeys = data));
        return { name, options: optionsWithImageKeys };
      });

      return await Promise.all(variants);
    };
    await convertDataWithImageKey().then(data => {
      variantsWithImageKeys = data;
    });

    let newData = { ...data, image: productImage, variants: variantsWithImageKeys, translations: {} };
    data.variants.forEach((v, index) => v.options?.length > 1 && delete newData[`checkbox${index}`]);

    post("/products", newData)
      .then(res => {
        toast.success(res?.data.message);
      })
      .then(() => router.push("/product-management"))
      .catch(err => toast.error(err));
  };

  const handleUploadImage = async imageFile => {
    if (!imageFile) return;

    let productKey = null;
    const params = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
      Key: `images/${imageFile?.name}`,
      Body: imageFile,
    };

    await uploadFileToS3(params)
      .then(res => {
        productKey = res?.Key;
      })
      .catch(err => toast.error(err));

    return productKey;
  };

  const renderAddProductForm = () => (
    <Form
      inputs={[
        {
          type: "text",
          label: toLocales("fe_product_id_mid_name"),
          name: "name",
          placeholder: toLocales("fe_product_id_mid_enter_name"),
          className: "mb-4",
        },
        {
          type: "select",
          label: toLocales("fe_product_id_mid_categories"),
          name: "categories",
          options: [{ value: "Foods" }, { value: "Drinks" }, { value: "Toppings" }],
          keyValue: "value",
          keyText: "value",
          multiple: true,
          placeholder: toLocales("fe_product_id_mid_select_categories"),
          className: "mb-4",
        },
        {
          type: "select",
          label: toLocales("fe_product_id_mid_tags"),
          name: "tags",
          options: [{ value: "Foods" }, { value: "Drinks" }, { value: "Toppings" }],
          keyValue: "value",
          keyText: "value",
          multiple: true,
          placeholder: toLocales("fe_product_id_mid_select_tags"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_product_id_mid_price"),
          name: "price",
          placeholder: toLocales("fe_product_id_mid_enter_price"),
          min: 0,
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_product_id_mid_description"),
          name: "description",
          placeholder: toLocales("fe_product_id_mid_enter_description"),
          className: "mb-6",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_product_id_mid_add"),
          onClick: handleSubmit(handleAddProduct),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  return (
    <div>
      <div className="flex justify-between flex-col sm:flex-row gap-8">
        <div className="w-full rounded-lg p-5 border border-gray-200">
          <p className="text-lg mb-6">{toLocales("fe_product_id_top_add_product")}</p>
          <div>
            <div className="text-xs sm:text-sm">
              <div className="flex justify-between gap-4 mb-3">
                <div
                  className={classnames("flex justify-center items-center text-center rounded-lg w-40 h-28", {
                    "border border-gray-300": !file,
                  })}
                >
                  {file ? (
                    <div className="rounded-lg w-28 h-28 overflow-hidden flex justify-center items-center shadow-lg">
                      <Image
                        src={URL.createObjectURL(file)}
                        className="block"
                        alt="preview-product"
                        width="112"
                        height="112"
                        style={{ objectFit: "fill" }}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 px-6">{toLocales("fe_product_id_mid_no_image")}</span>
                  )}
                </div>
                <div className="w-full">
                  <Input
                    type="file"
                    label={toLocales("fe_product_id_mid_product_image")}
                    name="file"
                    control={control}
                    className="[&>input]:cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
              {renderAddProductForm()}
            </div>
          </div>
        </div>
        <div className="w-full rounded-lg border border-gray-200">
          <div className="flex justify-between pt-5 px-5 items-start mb-6">
            <p className="text-lg">{toLocales("fe_product_id_top_add_variants")}</p>
            <Button
              className="border border-sky-400 text-sky-500 w-6 h-6 rounded-md bg-sky-50"
              title={<AiOutlinePlus size="1em" />}
              onClick={() => append(defaultVariant)}
            />
          </div>
          <FormProvider {...methods}>
            <div className="text-xs sm:text-sm h-[75vh]" style={{ overflow: "overlay" }}>
              <div className="pb-5 px-5 flex flex-col gap-4">
                {fields.map(
                  (variant, index) =>
                    variant?.options?.length > 0 && (
                      <AddVariants key={variant.id} index={index} onRemove={() => remove(index)} />
                    )
                )}
              </div>
            </div>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};

AddProduct.withSidebar = true;

export default AddProduct;
