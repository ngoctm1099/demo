import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { post } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import customerSchema from "../customerSchema";
import { defaultCustomer } from "../../../../constant/defaultValues";
import { toLocales } from "../../../../utils/string";

interface AddCustomerFormProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const AddCustomerForm = ({ openModal, setOpenModal }: AddCustomerFormProps) => {
  const methods = useForm({
    resolver: yupResolver(customerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: defaultCustomer,
  });
  const { handleSubmit, reset } = methods;

  const handleAddCustomer = data =>
    post("/customers", {
      ...data,
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response?.data?.errorMessage));

  const renderAddCustomerForm = () => (
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
          title: toLocales("fe_customer_popup_add"),
          onClick: handleSubmit(handleAddCustomer),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addCustomerFormPopup = {
    header: toLocales("fe_customer_top_add_customer"),
    body: renderAddCustomerForm(),
  };
  return (
    <div className="text-sm">
      <Modal
        {...addCustomerFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default AddCustomerForm;
