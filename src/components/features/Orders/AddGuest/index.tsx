/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { post } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import guestSchema from "./guestSchema";
import { defaultCustomer } from "../../../../constant/defaultValues";

interface AddGuestFormProps {
  openModal?: boolean;
  setOpenModal?: (val: boolean) => void;
  addGuest?: any;
}

const AddGuestForm = ({ openModal, setOpenModal, addGuest }: AddGuestFormProps) => {
  const methods = useForm({
    resolver: yupResolver(guestSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { ...defaultCustomer, type: "" },
  });
  const { handleSubmit, reset, watch } = methods;

  const restForm = watch("type")
    ? {
        new: [
          {
            type: "email",
            label: "Email",
            name: "email",
            placeholder: "Enter email",
            className: "mb-4",
          },
          {
            type: "text",
            label: "First name",
            name: "firstName",
            placeholder: "Enter first name",
            className: "mb-4",
          },
          {
            type: "text",
            label: "Last name",
            name: "lastName",
            placeholder: "Enter last name",
            className: "mb-4",
          },
          {
            type: "text",
            label: "Phone number",
            name: "phoneNumber",
            placeholder: "Enter phone number",
            className: "mb-4",
          },
        ],
        existed: [
          {
            type: "email",
            label: "Email",
            name: "email",
            placeholder: "Enter email",
            className: "mb-4",
          },
        ],
      }[watch("type")]
    : [];

  const renderAddGuestForm = () => (
    <Form
      inputs={[
        {
          type: "select",
          label: "Type",
          name: "type",
          options: [
            { text: "New Guest", value: "new" },
            { text: "Existed Guest", value: "existed" },
          ],
          keyValue: "value",
          keyText: "text",
          placeholder: "Select type",
          className: "mb-4",
        },
        ...restForm,
      ]}
      btns={[
        {
          title: "Add",
          onClick: handleSubmit(addGuest),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addGuestFormPopup = {
    header: "Add Guest",
    body: renderAddGuestForm(),
  };

  useEffect(() => {
    if (!openModal) reset();
  }, [openModal]);

  return (
    <div className="text-sm">
      <Modal
        {...addGuestFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default AddGuestForm;
