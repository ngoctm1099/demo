/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import classnames from "classnames";
import Button from "../Button";
import { AiOutlineDelete } from "react-icons/ai";
import { convertKeyToImage } from "../../utils/s3File";
import { toLocales } from "../../utils/string";

const ImageDropBox = ({ images, limit, setImages, onClickDeleteIcon }) => {
  const [imageBlobs, setImageBlobs] = useState([]);

  const handleLoadImage = files => {
    if (files.length > 0) {
      const newImages = [...images];
      if (newImages.length + files.length > limit) {
        toast.error("Limit 3 images");
        return;
      }

      for (const file of files) {
        if ((file as any).type.startsWith("image/")) {
          newImages.push(file);
          setImages(newImages);
        }
      }
    }
  };

  const handleDrop = async e => {
    e.preventDefault();

    const files = Array.from(e.dataTransfer.files);
    handleLoadImage(files);
  };

  const handleDragOver = e => {
    e.preventDefault();
  };

  const handleFileInput = e => {
    const files = Array.from(e.target.files);
    handleLoadImage(files);
  };

  const handleDeleteImage = index => {
    onClickDeleteIcon(index);
  };

  const convertImageToBlob = imgs => {
    const promiseImgs = imgs?.map(image => {
      if (image) {
        const existedBlob = imageBlobs?.find(({ name }) => name === `images/${image}`);
        if (existedBlob) return existedBlob;
        return convertKeyToImage(image)
          .then(resBlob => ({ src: resBlob, name: `images/${image}` }))
          .catch(err => console.log(err));
      }
    });

    return Promise.all(promiseImgs);
  };

  useEffect(() => {
    convertImageToBlob(images)
      .then(res => setImageBlobs(res))
      .catch(err => err);
  }, [images]);

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      className={classnames(
        "border-2 border-gray-300 border-dashed w-full min-h-[160px] p-2 rounded-lg cursor-pointer relative",
        "flex gap-2 items-center"
      )}
    >
      <input
        type="file"
        accept="image/*"
        multiple
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleFileInput}
      />
      {imageBlobs.map((image, index) => (
        <div key={index} className="relative sm:w-1/3">
          <div className="rounded w-full h-0 pb-[56.25%] overflow-hidden">
            <motion.img src={image?.src} className="cursor-auto" alt={`banner ${index + 1}`} />
          </div>
          <Button
            title={<AiOutlineDelete size="1.6em" />}
            onClick={() => handleDeleteImage(index)}
            className="absolute shadow-md right-2 bottom-2 bg-white/40 flex items-center justify-center rounded text-white hover:text-rose-500 hover:bg-white/90 p-1"
          />
        </div>
      ))}
      {images?.length === 0 && (
        <p className="text-gray-500 w-full text-center">{toLocales("fe_image_drop_zone_title")}</p>
      )}
    </div>
  );
};

export default ImageDropBox;
