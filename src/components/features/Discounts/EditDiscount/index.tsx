/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { put } from "../../../../../library/apiService";
import { DiscountProps } from "../../../../constant/defaultValues";
import Form from "../../../Form";
import Modal from "../../../Modal";
import editDiscountSchema from "./editDiscountSchema";
import { toLocales } from "../../../../utils/string";

interface EditUserFormProps {
  openModal: boolean;
  selectedDiscount: any;
  setOpenModal: (value: boolean) => void;
}

const EditUserForm = ({ openModal, selectedDiscount, setOpenModal }: EditUserFormProps) => {
  const methods = useForm({
    resolver: yupResolver(editDiscountSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      name: "",
      type: "",
      amount: "",
      startEndDate: null,
      quantity: "",
      promoCode: "",
    },
  });
  const { handleSubmit, setValue, reset, watch } = methods;

  const handleUpdateDiscount = () => {
    const discountData = watch();

    put("/discounts", {
      discount: { _id: selectedDiscount?._id },
      newDiscount: { ...discountData, startDate: discountData.startEndDate[0], endDate: discountData.startEndDate[1] },
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response.data?.errorMessage));
  };

  const renderEditUserForm = () => (
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
          title: toLocales("fe_discount_popup_update"),
          onClick: handleSubmit(handleUpdateDiscount),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const editUserFormPopup = {
    header: toLocales("fe_discount_popup_edit"),
    body: renderEditUserForm(),
  };

  useEffect(() => {
    if (selectedDiscount) {
      setValue("startEndDate", [new Date(selectedDiscount?.startDate), new Date(selectedDiscount?.endDate)]);
      for (let field in selectedDiscount) {
        if (field !== "startDate" && field !== "endDate") {
          setValue(field as keyof DiscountProps, selectedDiscount[field]);
        }
      }
    }
  }, [selectedDiscount]);

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

export default EditUserForm;
