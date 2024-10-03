/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { IoMdLock } from "react-icons/io";
import { toast } from "react-toastify";
import classnames from "classnames";
import { put } from "../../../../../../library/apiService";
import { defaultOutlet, OutletProps } from "../../../../../constant/defaultValues";
import Form from "../../../../Form";
import Modal from "../../../../Modal";
import editOutletSchema from "./EditOutletSchema";
import { toLocales } from "@gf/hermes";

interface EditOutletFormProps {
  openModal: boolean;
  selectedOutlet: any;
  setOpenModal: (value: boolean) => void;
}

const EditOutletForm = ({ openModal, selectedOutlet, setOpenModal }: EditOutletFormProps) => {
  const [isLocked, setIsLocked] = useState(selectedOutlet?.isLocked);
  const methods = useForm({
    resolver: yupResolver(editOutletSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultOutlet,
  });
  const { handleSubmit, setValue, reset } = methods;

  const handleUpdateOutlet = data => {
    put("/outlets", {
      outlet: { name: selectedOutlet.name },
      newOutlet: { ...data, isLocked, outletManagers: selectedOutlet.outletManagers.map(({ email }) => email) },
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error?.response?.data?.errorMessage));
  };

  const renderEditOutletForm = () => (
    <Form
      inputs={[
        {
          type: "text",
          label: toLocales("fe_settings_outlets_popup_name"),
          name: "name",
          placeholder: toLocales("fe_settings_outlets_popup_enter_name"),
          disabled: isLocked,
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_settings_outlets_popup_address"),
          name: "address",
          placeholder: toLocales("fe_settings_outlets_popup_enter_address"),
          disabled: isLocked,
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_settings_outlets_popup_start_operating_hour"),
          name: "startOperatingHours",
          placeholder: toLocales("fe_settings_outlets_popup_select_start_operating_hour"),
          disabled: isLocked,
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_settings_outlets_popup_end_operating_hour"),
          name: "endOperatingHours",
          placeholder: toLocales("fe_settings_outlets_popup_select_end_operating_hour"),
          disabled: isLocked,
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_settings_outlets_popup_rest_manager"),
          disabled: true,
          name: "outletManagers",
          className: "mb-4",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_settings_outlets_popup_update"),
          onClick: handleSubmit(handleUpdateOutlet),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const editUserFormPopup = {
    header: (
      <div className="flex gap-4 items-center">
        <span>{toLocales("fe_settings_outlets_popup_edit")}</span>
        <div
          className={classnames(
            isLocked ? "text-gray-600" : "text-gray-200",
            "h-8 sm:h-10 flex items-center justify-center cursor-pointer"
          )}
          onClick={() => setIsLocked(!isLocked)}
        >
          <IoMdLock size="1em" />
        </div>
      </div>
    ),
    body: renderEditOutletForm(),
  };

  useEffect(() => {
    for (let field in selectedOutlet) {
      setValue(
        field as keyof OutletProps,
        field === "outletManagers"
          ? selectedOutlet?.outletManagers?.map(mngr => `${mngr.firstName} ${mngr.lastName}`).join(", ")
          : selectedOutlet[field]
      );
    }
  }, [selectedOutlet]);

  return (
    <div className="text-sm">
      <Modal
        {...editUserFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default EditOutletForm;
