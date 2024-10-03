/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Image from "next/image";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { put } from "../../../../../library/apiService";
import Button from "../../../Button";
import Input from "../../../Input";
import Select from "../../../Select";
import { convertKeyToImage, uploadFileToS3 } from "../../../../utils/s3File";
import { toLocales } from "@gf/hermes";

const GeneralSettings = ({ settings }) => {
  const [data, setData] = useState<any>();
  const [avatarImage, setAvatarImage] = useState<any>();

  const generalData = data?.filter(
    ({ _id }) => _id !== "6486db258aef628fc17ae3e6" && _id !== "6486dbb18aef628fc17ae436"
  );
  const restaurantData = data?.filter(
    ({ _id }) => _id === "6486db258aef628fc17ae3e6" || _id === "6486dbb18aef628fc17ae436"
  );

  const methods = useForm({
    shouldUnregister: true,
  });
  const { control, setValue, watch } = methods;
  const file = watch("file");

  const handleSaveSettings = (name, value, onSuccessCb?, onErrorCb?) =>
    put("/settings", {
      setting: { name },
      newSetting: value,
    })
      .then(res => {
        toast.success(res.data?.message);
        if (onSuccessCb) onSuccessCb();
      })
      .catch(err => {
        toast.error(err);
        if (onErrorCb) onErrorCb();
      });

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

  const handleUploadLogo = async (name, file) => {
    let image = null;

    if (file instanceof File) image = await handleUploadImage(file);

    return image && handleSaveSettings(name, { value: image });
  };

  const renderGeneralSettings = dataArr =>
    dataArr?.map((item, index) => {
      switch (item?.name) {
        case "DC":
          return (
            <div className="flex items-end gap-3 sm:gap-4" key={`${item?.name}-${index}`}>
              <Select
                name={item?.name}
                control={control}
                options={item?.value?.options}
                label={item?.description}
                keyText="unit"
                keyValue="unit"
                placeholder="Select unit"
                className="w-full"
              />
              <Button
                title="Apply"
                onClick={() =>
                  handleSaveSettings(item?.name, { ...item, value: { ...item?.value, unit: watch(item?.name) } })
                }
                className="border-sky-600 border-[1px] mb-1 text-sky-600 hover:text-sky-700 px-3 py-2 rounded-md"
              />
            </div>
          );

        case "Logo":
          return;

        default:
          return (
            <Input
              control={control}
              key={`${item?.name}-${index}`}
              label={item?.description}
              name={item?.name}
              type="text"
              placeholder="Enter value"
              className="w-full"
              actionLabel="Apply"
              onAction={() => handleSaveSettings(item?.name, { ...item, value: Number(watch(item?.name)) })}
            />
          );
      }
    });

  const renderRestaurantSettings = dataArr => (
    <div>
      {dataArr
        ?.sort((a, b) => (a._id > b._id ? -1 : 1))
        ?.map((item, index) => {
          switch (item?.name) {
            case "RN":
              return (
                <Input
                  key={`${item?.name}-${index}`}
                  type="text"
                  label={item?.description}
                  name={item?.name}
                  control={control}
                  className="w-full"
                  placeholder="Enter name"
                  actionLabel="Apply"
                  onAction={() => handleSaveSettings(item?.name, { ...item, value: watch(item?.name) })}
                />
              );
            case "RL":
              return (
                <div key={`${item?.name}-${index}`} className="flex items-center gap-8 mb-4">
                  <div
                    className={classnames(
                      "flex justify-center items-center text-center rounded-full min-w-[4rem] w-16 h-16 xl:min-w-[6rem] xl:w-24 xl:h-24",
                      {
                        "border border-gray-300": !avatarImage,
                      }
                    )}
                  >
                    {avatarImage ? (
                      <div className="rounded-full min-w-[4rem] w-16 h-16 xl:min-w-[6rem] md:min-w-[5rem] md:min-h-[5rem] xl:w-24 xl:h-24 relative overflow-hidden flex justify-center items-center shadow-lg">
                        <Image src={avatarImage} className="block" alt="preview-product" fill sizes="100vw" />
                      </div>
                    ) : (
                      <span className="text-gray-400 text-xs">No image</span>
                    )}
                  </div>
                  <div className="flex flex-col w-full gap-2">
                    <Input
                      type="file"
                      label={item?.description}
                      name="file"
                      control={control}
                      className="[&>input]:cursor-pointer w-full"
                      accept="image/*"
                    />
                    <Button
                      title="Apply"
                      onClick={() => handleUploadLogo(item?.name, file)}
                      className="border-sky-600 border-[1px] mb-3 text-sky-600 hover:text-sky-700 px-3 py-1.5 rounded-md"
                    />
                  </div>
                </div>
              );
            default:
              return;
          }
        })}
    </div>
  );

  useEffect(() => {
    file &&
      convertKeyToImage(file)
        .then(res => setAvatarImage(res))
        .catch(err => {});
  }, [file]);

  useEffect(() => {
    if (settings) {
      setData(settings);

      settings?.forEach(({ name, value }) => {
        switch (name) {
          case "RL":
            setValue("file", value);
            break;

          case "DC":
            setValue(name, value?.unit);
            break;

          case "Lang":
            setValue(name, value?.language);
            break;

          default:
            setValue(name, value);
        }
      });
    }
  }, [settings]);

  return (
    <div className="p-1 sm:px-5 flex flex-col gap-8 sm:pt-3 sm:pb-6">
      <div>
        <p className="text-base sm:text-xl font-semibold text-gray-600 mb-6">
          {toLocales("fe_settings_settings_restaurant_top_title")}
        </p>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {renderRestaurantSettings(restaurantData)}
          </div>
        </div>
      </div>
      <div>
        <p className="text-base sm:text-xl font-semibold text-gray-600 mb-6">
          {toLocales("fe_settings_membership_general_top_title")}
        </p>
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">{renderGeneralSettings(generalData)}</div>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;
