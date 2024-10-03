/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import Image from "next/image";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { defaultProfile, ProfileProps } from "../src/constant/defaultValues";
import { convertKeyToImage, uploadFileToS3 } from "../src/utils/s3File";
import Input from "../src/components/Input";
import Form from "../src/components/Form";
import { put } from "../library/apiService";
import { userActions } from "../redux/actions";
import { connect } from "react-redux";
import { languageCodes } from "../src/constant/regionCodes";
import { toLocales } from "../src/utils/string";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const mapDispatchToProps = dispatch => ({
  updateUser: payload => dispatch(userActions.updateUser(payload)),
});

const Profile = ({ user, updateUser }) => {
  const [avatarImage, setAvatarImage] = useState<any>();
  const methods = useForm({
    shouldUnregister: true,
    defaultValues: defaultProfile,
  });
  const { control, watch, setValue, handleSubmit } = methods;
  const file = watch("file");
  const language = watch("language");

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

  const handleUpdateProfile = async data => {
    let image = null;
    // if language input !== localstorage => update language (key locale)

    if (data.file instanceof File) image = await handleUploadImage(data.file);

    put("/users", { user: { email: user.email }, newUser: { ...data, avatar: image || user?.avatar, file: undefined } })
      .then(res => {
        const { message, data } = res?.data;
        toast.success(message);
        return data;
      })
      .then(data => {
        updateUser({ ...user, ...data, role: user.role });
      })
      .catch(err => toast.error(err));
  };

  const profileForm = (
    <Form
      inputs={[
        {
          type: "text",
          label: toLocales("fe_profile_mid_first_name"),
          name: "firstName",
          placeholder: toLocales("fe_profile_mid_enter_first_name"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_profile_mid_last_name"),
          name: "lastName",
          placeholder: toLocales("fe_profile_mid_enter_last_name"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_profile_mid_email"),
          name: "email",
          placeholder: toLocales("fe_profile_mid_enter_email"),
          className: "mb-4",
        },
        {
          type: "select",
          label: toLocales("fe_profile_mid_language"),
          name: "language",
          options: languageCodes,
          keyValue: "isoCode",
          keyText: "title",
          placeholder: toLocales("fe_profile_mid_select_language"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_profile_mid_role"),
          name: "role",
          disabled: true,
          placeholder: toLocales("fe_profile_mid_select_role"),
          className: "mb-4",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_profile_mid_save"),
          onClick: handleSubmit(handleUpdateProfile),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  useEffect(() => {
    if (user) {
      const formData = {
        file: user?.avatar,
        firstName: user?.firstName,
        lastName: user?.lastName,
        language: user?.language,
        email: user?.email,
        role: user?.role?.role,
      };
      for (let field in formData) {
        if (field === "language") {
          const currentLanguage = localStorage.getItem("locale");
          if (currentLanguage) setValue(field as keyof ProfileProps, currentLanguage);
        } else setValue(field as keyof ProfileProps, formData[field]);
      }
    }
  }, [user]);

  useEffect(() => {
    file &&
      convertKeyToImage(file)
        .then(res => setAvatarImage(res))
        .catch(err => {});
  }, [file]);

  useEffect(() => {
    localStorage.setItem("locale", language);
  }, [language]);

  return (
    <div className="p-1 sm:px-5 sm:py-3 text-xs sm:text-sm max-w-lg mx-auto">
      <p className="text-lg sm:text-xl font-semibold text-gray-600 pb-3">{toLocales("fe_profile_top_title")}</p>
      <div className="flex items-center gap-4 mb-4">
        <div
          className={classnames("flex justify-center items-center text-center rounded-full w-16 h-16 xl:w-24 xl:h-24", {
            "border border-gray-300": !avatarImage,
          })}
        >
          {avatarImage ? (
            <div className="rounded-full w-16 h-16 xl:w-24 xl:h-24 overflow-hidden flex justify-center items-center shadow-lg">
              <Image
                src={avatarImage}
                className="block"
                alt="preview-product"
                width="112"
                height="112"
                style={{ objectFit: "fill" }}
              />
            </div>
          ) : (
            <span className="text-gray-400 px-6 text-xs">No image</span>
          )}
        </div>
        <Input
          type="file"
          label={toLocales("fe_profile_mid_avatar")}
          name="file"
          control={control}
          className="[&>input]:cursor-pointer"
          accept="image/*"
        />
      </div>
      {profileForm}
    </div>
  );
};
Profile.withSidebar = true;

export default connect(mapStateToProps, mapDispatchToProps)(Profile);
