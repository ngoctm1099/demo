import React, { useEffect, useState } from "react";
import Button from "../../../Button";
import { uploadFileToS3 } from "../../../../utils/s3File";
import { toast } from "react-toastify";
import Modal from "../../../Modal";
import { get, put } from "../../../../../library/apiService";
import ImageDropBox from "../../../ImageDropBox";
import { toLocales } from "@gf/hermes";

const Banner = ({ bannerLimit }) => {
  const [bannerImages, setBannerImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState<any>();
  const [openDeleteImageModal, setOpenDeleteImageModal] = useState(false);

  const openDeleteModal = index => {
    setSelectedImageIndex(index);
    setOpenDeleteImageModal(true);
  };

  const deleteImage = () => {
    setBannerImages(bannerImages?.filter((b, imageIndex) => imageIndex !== selectedImageIndex));
    setOpenDeleteImageModal(false);
  };

  const handleUploadImage = async imageFile => {
    if (!imageFile) return;
    if (typeof imageFile === "string" && imageFile?.includes("images/")) return imageFile;

    let imageKey = null;
    const params = {
      Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
      Key: `images/${imageFile?.name}`,
      Body: imageFile,
    };

    await uploadFileToS3(params)
      .then(res => {
        imageKey = res?.Key;
      })
      .catch(err => toast.error(err));

    return imageKey;
  };

  const uploadBanner = async images => {
    const convertBannerToImageKey = async imgs => {
      const newBannerKey = imgs.map(async img => await handleUploadImage(img));

      return await Promise.all(newBannerKey);
    };

    const banner = await convertBannerToImageKey(images);

    put("/outlets/6460f7dcab8f30893d6902c8/banner", banner)
      .then(res => toast.success(res.data?.message))
      .catch(err => toast.error(err));
  };

  useEffect(() => {
    get("/outlets/6460f7dcab8f30893d6902c8/banner?row=3&page=1", undefined)
      .then(response => {
        const { data } = response || {};
        return data?.data?.banner;
      })
      .then(banners => setBannerImages(banners));
  }, []);

  return (
    <div className="p-1 sm:px-5 sm:py-3 overflow-auto">
      <div className="flex flex-col gap-1 mb-4">
        <div className="flex justify-between items-center">
          <p className="text-base sm:text-xl font-semibold text-gray-600 pb-1">
            {toLocales("fe_settings_banner_top_title")}
          </p>
          <Button
            title={toLocales("fe_settings_banner_mid_upload")}
            onClick={() => uploadBanner(bannerImages)}
            className="text-sky-600 hover:text-sky-700 w-fit border border-sky-600 px-4 py-2 rounded-md"
          />
        </div>
        <p className="text-gray-500 font-light">
          {toLocales("fe_settings_banner_limit")} - {bannerLimit?.value || 0}{" "}
          {toLocales("fe_settings_banner_mid_images")}
        </p>
      </div>
      <ImageDropBox
        images={bannerImages}
        limit={bannerLimit?.value}
        setImages={setBannerImages}
        onClickDeleteIcon={openDeleteModal}
      />
      {openDeleteImageModal && (
        <Modal
          open={openDeleteImageModal}
          setOpen={setOpenDeleteImageModal}
          header={`Delete image ${selectedImageIndex + 1}`}
          className="!max-w-sm"
          body={
            <div className="w-full flex justify-evenly gap-4">
              <Button
                title="Cancel"
                className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={() => setOpenDeleteImageModal(false)}
              />
              <Button
                title="Delete"
                className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={deleteImage}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

export default Banner;
