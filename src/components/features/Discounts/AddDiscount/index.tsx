import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { post } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import addDiscountSchema from "./addDiscountSchema";
import { toLocales } from "@gf/hermes";

interface AddDiscountFormProps {
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const AddDiscountForm = ({ openModal, setOpenModal }: AddDiscountFormProps) => {
  const methods = useForm({
    resolver: yupResolver(addDiscountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: { name: "", type: "", amount: "", quantity: "", startEndDate: null, promoCode: "" },
  });
  const { handleSubmit, reset, watch } = methods;

  const handleAddDiscount = () => {
    const data = watch();

    post("/discounts", { ...data, startDate: data.startEndDate[0], endDate: data.startEndDate[1] })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response.data?.errorMessage));
  };

  const renderAddDiscountForm = () => (
    <Form
      inputs={[
        {
          type: "text",
          label: toLocales("fe_discount_popup_name"),
          name: "name",
          placeholder: toLocales("fe_discount_popup_enter_name"),
          className: "mb-4",
        },
        {
          type: "select",
          label: toLocales("fe_discount_popup_type"),
          name: "type",
          options: [{ value: "Percent" }, { value: "Fixed Amount" }],
          keyText: "value",
          keyValue: "value",
          placeholder: toLocales("fe_discount_popup_select_type"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_discount_popup_amount"),
          name: "amount",
          placeholder: toLocales("fe_discount_popup_enter_amount"),
          className: "mb-4",
        },
        {
          type: "dateRange",
          label: toLocales("fe_discount_popup_start_end_date"),
          name: "startEndDate",
          showPopperArrow: false,
          minDate: new Date(),
          placeholder: toLocales("fe_discount_popup_select_date"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_discount_popup_quantity"),
          name: "quantity",
          placeholder: toLocales("fe_discount_popup_enter_quantity"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_discount_popup_promo_code"),
          name: "promoCode",
          placeholder: toLocales("fe_discount_popup_enter_promo_code"),
          className: "mb-4",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_discount_popup_add"),
          onClick: handleSubmit(handleAddDiscount),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addUserFormPopup = {
    header: toLocales("fe_discount_top_add_discount"),
    body: renderAddDiscountForm(),
  };

  return (
    <div className="text-sm">
      <Modal
        {...addUserFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm max-w-sm"
      />
    </div>
  );
};

export default AddDiscountForm;
