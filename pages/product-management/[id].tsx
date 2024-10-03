/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import classnames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AiOutlinePlus } from "react-icons/ai";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetcher, put } from "../../library/apiService";
import Button from "../../src/components/Button";
import addProductSchema from "../../src/components/features/Products/AddProduct/addProductSchema";
import AddVariants from "../../src/components/features/Products/Variants/AddVariants";
import Form from "../../src/components/Form";
import Input from "../../src/components/Input";
import { defaultVariant, ProductProps } from "../../src/constant/defaultValues";
import { isValidImageKey } from "../../src/utils";
import { convertKeyToImage, uploadFileToS3 } from "../../src/utils/s3File";
import { withLoading } from "../../src/components/Loading/withLoading";
import Select from "../../src/components/Select";
import { languageCodes } from "../../src/constant/regionCodes";

const ProductId = ({ setLoading }) => {
  const router = useRouter();
  const id = router.query.id;

  const [productImage, setProductImage] = useState<any>();
  const { data: productData } = useSWR(id ? `products/${id}` : null, id ? fetcher : null);
  const defaultLanguage = localStorage.getItem("locale") || "en_US";
  const methods = useForm({
    resolver: yupResolver(addProductSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      productLanguage: defaultLanguage,
      file: null,
      name: "",
      categories: null,
      tags: null,
      price: "",
      description: "",
      variants: [defaultVariant],
    },
  });
  const { control, watch, handleSubmit, setValue } = methods;
  const { file } = watch();

  const fieldArrayMethods = useFieldArray({
    control,
    name: "variants",
  });

  const { fields, append, remove } = fieldArrayMethods;

  const handleUpdateProduct = async () => {
    const { file: f, ...data } = watch();

    const productImage = isValidImageKey(f) ? f : await handleUploadImage(f);
    let variantsWithImageKeys = [];

    const convertDataWithImageKey = async () => {
      const variants = data.variants.map(async ({ name, options }) => {
        let optionsWithImageKeys = [];
        const convertOptionsWithImageKey = async () => {
          const newOptions = options.map(async option => {
            const imageKey = await handleUploadImage(option.image);
            return {
              ...option,
              image: isValidImageKey(option.image) ? option.image : imageKey,
            };
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

    put("/products", { product: { _id: id }, newProduct: newData })
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

  const renderUpdateProductForm = () => (
    <Form
      inputs={[
        {
          type: "text",
          label: "Name",
          name: "name",
          placeholder: "Enter name",
          className: "mb-4",
        },
        {
          type: "select",
          label: "Categories",
          name: "categories",
          options: [{ value: "Foods" }, { value: "Drinks" }, { value: "Toppings" }],
          keyValue: "value",
          keyText: "value",
          multiple: true,
          placeholder: "Select categories",
          className: "mb-4",
        },
        {
          type: "select",
          label: "Tags",
          name: "tags",
          options: [{ value: "Foods" }, { value: "Drinks" }, { value: "Toppings" }],
          keyValue: "value",
          keyText: "value",
          multiple: true,
          placeholder: "Select tags",
          className: "mb-4",
        },
        {
          type: "text",
          label: "Price",
          name: "price",
          placeholder: "$USD",
          min: 0,
          className: "mb-4",
        },
        // {
        //   type: "text",
        //   label: "Quantity",
        //   name: "quantity",
        //   placeholder: "Enter quantity",
        //   min: 0,
        //   className: "mb-4",
        // },
        {
          type: "text",
          label: "Description",
          name: "description",
          placeholder: "Enter description",
          className: "mb-6",
        },
      ]}
      btns={[
        {
          title: "Update",
          onClick: handleSubmit(handleUpdateProduct),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  useEffect(() => {
    if (productData) return setLoading(false);
    return setLoading(true);
  }, [productData]);

  useEffect(() => {
    convertKeyToImage(file)
      .then(res => setProductImage(res))
      .catch(err => {});
  }, [file]);

  useEffect(() => {
    if (productData) {
      const { _id, __v, ...data } = productData?.data;
      for (let x in data) {
        if (x === "image") {
          setValue("file", data[x]);
        } else setValue(x as keyof ProductProps, data[x]);
      }
    }
  }, [productData]);

  return (
    <div>
      <div className="flex justify-between flex-col sm:flex-row gap-8">
        <div className="w-full rounded-lg p-5 border border-gray-200">
          <div className="flex justify-between items-center mb-6">
            <p className="text-lg">Edit {productData?.data?.name}</p>
            <div className="flex gap-6 items-center">
              <span className="text-base text-gray-500">Language</span>
              <Select
                control={control}
                name="productLanguage"
                options={languageCodes}
                keyText="title"
                keyValue="isoCode"
                className="min-w-min"
              />
            </div>
          </div>
          <div>
            <div className="text-xs sm:text-sm">
              <div className="flex justify-between gap-4 mb-3">
                <div
                  className={classnames("flex justify-center items-center text-center rounded-lg w-40 h-28", {
                    "border border-gray-300": !productImage,
                  })}
                >
                  {productImage ? (
                    <div className="rounded-lg w-28 h-28 overflow-hidden flex justify-center items-center shadow-lg">
                      <Image
                        src={productImage}
                        className="block"
                        alt="preview-product"
                        width="112"
                        height="112"
                        style={{ objectFit: "fill" }}
                      />
                    </div>
                  ) : (
                    <span className="text-gray-400 px-6">No image</span>
                  )}
                </div>
                <div className="w-full">
                  <Input
                    type="file"
                    label="Product image"
                    name="file"
                    control={control}
                    className="[&>input]:cursor-pointer"
                    accept="image/*"
                  />
                </div>
              </div>
              {renderUpdateProductForm()}
            </div>
          </div>
        </div>
        <div className="w-full rounded-lg border border-gray-200">
          <div className="flex justify-between pt-7 py-2 px-5 items-start mb-6">
            <p className="text-lg">Variants</p>
            <div className="flex gap-3 items-center">
              <Button
                className="border border-sky-400 text-sky-500 w-8 h-8 rounded-md bg-sky-50"
                title={<AiOutlinePlus size="1em" />}
                onClick={() => append(defaultVariant)}
              />
            </div>
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

ProductId.withSidebar = true;

export default withLoading(ProductId);
