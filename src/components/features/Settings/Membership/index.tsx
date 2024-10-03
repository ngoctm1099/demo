/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import classnames from "classnames";
import { put } from "../../../../../library/apiService";
import Button from "../../../Button";
import Input from "../../../Input";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import ColorCard from "../../../Card/ColorCard";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { IconContext } from "react-icons/lib";
import { icons } from "../../../../constant/tiers";
import Modal from "../../../Modal";
import { TierProps } from "../../../../constant/defaultValues";
import { yupResolver } from "@hookform/resolvers/yup";
import membershipSettingsSchema from "./membershipSettingsSchema";

const colorPalettes = [
  { color: "bg-green-500", name: "Green", activeColor: "bg-green-700" },
  { color: "bg-red-500", name: "Red", activeColor: "bg-red-700" },
  { color: "bg-yellow-400", name: "Yellow", activeColor: "bg-yellow-600" },
  { color: "bg-sky-500", name: "Blue", activeColor: "bg-sky-700" },
  { color: "bg-slate-300", name: "Silver", activeColor: "bg-slate-500" },
];

const Membership = ({ memberships }) => {
  const [data, setData] = useState<any>();
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<any>();
  const [selectedTier, setSelectedTier] = useState<any>();
  const [membershipTiers, setMembershipTiers] = useState([]);
  const [openDeleteTierModal, setOpenDeleteTierModal] = useState(false);

  const ratio = data?.find(({ _id }) => _id === "644e293734e0b8fbe177d681");
  const tier = data?.find(({ _id }) => _id === "646a3972ad10bd9aedef4406");

  const methods = useForm({
    resolver: yupResolver(membershipSettingsSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      unit: "",
      points: 0,
      newTitle: "",
      newPoints: "",
    },
  });
  const { control, setValue, watch } = methods;

  const handleSaveSettings = (name, value) =>
    put("/settings", {
      setting: { name },
      newSetting: value,
    })
      .then(res => toast.success(res.data?.message))
      .catch(err => toast.error(err));

  const saveMembershipRatio = () => {
    const newRatio = {
      ...ratio,
      value: [
        {
          name: "unit",
          value: Number(watch("unit")),
        },
        { name: "points", value: Number(watch("points")) },
      ],
    };

    return handleSaveSettings("Ratio", newRatio);
  };

  const saveMembershipTiers = () => {
    const newTiers = { ...tier, value: membershipTiers };

    return handleSaveSettings("Tier", newTiers);
  };

  const renderMembershipRatio = membershipRatio =>
    membershipRatio && (
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-start sm:items-center ">
        <Input
          control={control}
          label={membershipRatio?.description}
          name={membershipRatio?.value[0]?.name}
          type="text"
          placeholder="Enter value"
          className="w-full"
          actionLabel="SGD"
        />
        <HiOutlineSwitchHorizontal className="hidden sm:block mt-6 text-2xl text-gray-400" />
        <Input
          control={control}
          name={membershipRatio?.value[1]?.name}
          type="text"
          placeholder="Enter points"
          className="w-full mb-2 sm:mt-8"
          actionLabel="Points"
        />
      </div>
    );

  const renderTiers = tiers =>
    tiers?.map(({ title, points, color, label }, index) => (
      <ColorCard
        icon={icons?.find(item => item?.label === label)?.icon}
        IconProps={{ size: "4rem", className: "opacity-60" }}
        title={title}
        points={points}
        key={`${title}-${index}`}
        color={color}
        onClose={() => {
          setSelectedTier(title);
          setOpenDeleteTierModal(true);
        }}
      />
    ));

  const renderColorPicker = () => (
    <div>
      <p className="mb-3 text-sm sm:text-base font-semibold">Color Palette</p>
      <div className="flex gap-2 xl:gap-4 flex-wrap justify-between">
        {colorPalettes?.map(({ color, name, activeColor }) => (
          <div className="flex flex-col gap-2 justify-center items-center" key={color}>
            <div
              className={classnames(
                "rounded-md flex items-center justify-center text-white cursor-pointer h-8 w-12 sm:h-9 xl:h-10 xl:w-16 transition-all duration-200",
                selectedColor === color ? activeColor : color
              )}
              onClick={() => setSelectedColor(color)}
            >
              {selectedColor === color && <IoIosCheckmarkCircleOutline size="1.4rem" />}
            </div>
            <div className="md:text-xs">{name}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderIconPicker = () => (
    <div>
      <p className="mb-3 text-sm sm:text-base font-semibold">Icons Picker</p>
      <div className="flex gap-2 xl:gap-4 flex-wrap justify-between">
        {icons?.map(({ icon, label }) => (
          <div className="flex flex-col gap-2 justify-center items-center" key={label}>
            <div
              className={classnames(
                "rounded-md flex items-center justify-center text-white cursor-pointer h-8 w-12 sm:h-9 xl:h-10 xl:w-16 bg-slate-300 transition-all duration-200",
                selectedIcon?.label === label && "bg-slate-500"
              )}
              onClick={() => setSelectedIcon({ icon, label })}
            >
              <IconContext.Provider value={{ size: "1.4rem" }}>{icon}</IconContext.Provider>
            </div>
            <div className="text-xs">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleAddTier = () => {
    const { newTitle, newPoints } = watch();
    const isExistedTitle = membershipTiers?.find(({ title }) => title.toLowerCase() === newTitle.toLowerCase());
    const isExistedPoint = membershipTiers?.find(({ points }) => points === newPoints);

    if (isExistedTitle && isExistedPoint) return toast.error("Existed tier");
    if (!isExistedTitle && isExistedPoint) return toast.error("Existed point");
    if (isExistedTitle && !isExistedPoint) return toast.error("Existed title");

    return setMembershipTiers(
      [
        ...membershipTiers,
        { title: newTitle, points: newPoints, color: selectedColor, label: selectedIcon?.label },
      ].sort((a, b) => b?.points - a?.points)
    );
  };

  useEffect(() => {
    ratio?.value?.forEach(({ name, value }) => setValue(name as keyof TierProps, value));
  }, [ratio]);

  useEffect(() => {
    if (tier?.value) setMembershipTiers(tier?.value);
  }, [tier]);

  useEffect(() => {
    if (memberships) {
      setData(memberships);
    }
  }, [memberships]);

  return (
    <div className="p-2 lg:px-5 lg:pt-3 lg:pb-6">
      <div className="flex justify-between items-center mb-6">
        <p className="text-base sm:text-xl font-semibold text-gray-600">General</p>
        <Button
          title="Save Ratio"
          onClick={saveMembershipRatio}
          className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider py-2 px-4 block"
        />
      </div>
      <div className="flex flex-col gap-6 w-full">
        <div className="">{renderMembershipRatio(ratio)}</div>
        <div className="pt-6 border-t-[1px]">
          <div className="flex justify-between items-center mb-6">
            <p className="text-base sm:text-xl font-semibold text-gray-600">Membership Settings</p>
            <Button
              title="Save Tiers"
              onClick={saveMembershipTiers}
              className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider py-2 px-4 block"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 w-full gap-6 sm:gap-12 lg:gap-16 text-gray-500">
            <div className="border-b-[1px] sm:border-none border-gray-200">
              <p className="text-sm sm:text-base font-semibold text-gray-500 pb-2">{tier?.description}</p>
              <div className="flex gap-4 flex-col">{renderTiers(membershipTiers)}</div>
            </div>
            <div className="flex flex-col gap-4 justify-between">
              {renderColorPicker()}
              {renderIconPicker()}
              <div className="flex gap-6 justify-between">
                <Input
                  name="newTitle"
                  control={control}
                  onAfterChange={(e, onChangeCb) => {
                    onChangeCb({
                      ...e,
                      target: { ...e.target, value: e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1) },
                    });
                  }}
                  placeholder="Enter title"
                  label="Title"
                  className="w-full"
                />
                <Input
                  name="newPoints"
                  control={control}
                  placeholder="Enter points"
                  label="Points"
                  className="w-full"
                />
              </div>
              <Button
                title="Add Tier"
                disabled={
                  membershipTiers?.filter(({ title }) => title).length >= 5 ||
                  !(selectedColor && selectedIcon && watch("newTitle") && watch("newPoints"))
                }
                onClick={handleAddTier}
                className="bg-sky-500 hover:bg-sky-600 py-2 px-4 mt-2 sm:mt-4 text-white rounded-md"
              />
            </div>
          </div>
        </div>
      </div>
      <Modal
        header={`Delete Tier ${selectedTier}`}
        open={openDeleteTierModal}
        setOpen={setOpenDeleteTierModal}
        className="!max-w-sm"
        body={
          <div className="w-full flex justify-evenly gap-4">
            <Button
              title="Cancel"
              className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
              onClick={() => setOpenDeleteTierModal(false)}
            />
            <Button
              title="Delete"
              className="text-white bg-rose-500 mb-4 sm:mb-0 hover:bg-rose-600 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
              onClick={() => {
                setMembershipTiers(membershipTiers?.filter(tier => tier?.title !== selectedTier));
                setOpenDeleteTierModal(false);
              }}
            />
          </div>
        }
      />
    </div>
  );
};

export default Membership;
