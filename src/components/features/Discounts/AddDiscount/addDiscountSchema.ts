import * as yup from "yup";

const addDiscountSchema = yup.object().shape({
  name: yup.string().required("Please enter name"),
  type: yup.string().required("Please select type"),
  amount: yup
    .string()
    .required("Please enter amount")
    .matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid amount"),
  startEndDate: yup.array().nullable().of(yup.date()).required("Please select start date"),
  quantity: yup.string().matches(/^[0-9]\d*$/, "Must be a valid limit"),
  promoCode: yup.string().required("Please enter promo code"),
});

export default addDiscountSchema;
