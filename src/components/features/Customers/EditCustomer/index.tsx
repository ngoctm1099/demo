/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { put } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import customerSchema from "../customerSchema";
import { defaultCustomer, CustomerProps } from "../../../../constant/defaultValues";
import { toLocales } from "@gf/hermes";

interface EditCustomerFormProps {
  selectedCustomer: any;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const EditCustomerForm = ({ selectedCustomer, openModal, setOpenModal }: EditCustomerFormProps) => {
  const methods = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultCustomer,
  });
  const { handleSubmit, reset, setValue } = methods;

  const handleEditCustomer = data =>
    put(`/customers/${selectedCustomer?._id}`, {
      ...data,
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response?.data?.errorMessage));

  const renderEditCustomerForm = () => (
    <Form
      inputs={[
        {
          type: "email",
          label: toLocales("fe_customer_popup_email"),
          name: "email",
          placeholder: toLocales("fe_customer_popup_enter_email"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_customer_popup_first_name"),
          name: "firstName",
          placeholder: toLocales("fe_customer_popup_enter_first_name"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_customer_popup_last_name"),
          name: "lastName",
          placeholder: toLocales("fe_customer_popup_enter_last_name"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_customer_popup_phone_number"),
          name: "phoneNumber",
          placeholder: toLocales("fe_customer_popup_enter_phone_number"),
          className: "mb-4",
        },
        {
          type: "search",
          label: toLocales("fe_customer_popup_link_membership"),
          name: "membership",
          autoComplete: "off",
          keyValue: "memberPoints",
          keyText: "membershipId",
          renderOptionValue: item => `${item.membershipId} (${item.memberPoints})`,
          searchEndpoint: "memberships",
          limit: 3,
          placeholder: toLocales("fe_customer_popup_enter_link_membership"),
          className: "mb-4",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_customer_popup_update"),
          onClick: handleSubmit(handleEditCustomer),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addUserFormPopup = {
    header: toLocales("fe_customer_popup_edit"),
    body: renderEditCustomerForm(),
  };

  useEffect(() => {
    const customer = {
      email: selectedCustomer.email,
      phoneNumber: selectedCustomer.phoneNumber,
      firstName: selectedCustomer.firstName,
      lastName: selectedCustomer.lastName,
      membership: {
        membershipId: selectedCustomer.membership?.membershipId,
        memberPoints: selectedCustomer.membership?.memberPoints,
      },
    };

    for (let field in customer) {
      setValue(field as keyof CustomerProps, customer[field]);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    if (!openModal) reset();
  }, [openModal]);

  return (
    <div className="text-sm">
      <Modal
        {...addUserFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default EditCustomerForm;
