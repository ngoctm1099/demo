import * as yup from "yup";

const membershipSchema = yup.object().shape({
  membershipId: yup
    .string()
    .required("Please enter id")
    .matches(/^MBS[\d\*]{7}\d{3}$/, "Must be a valid ID"),
  memberPoints: yup
    .string()
    .required("Please enter points")
    .matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid points"),
  // user: yup.string(),
});

export default membershipSchema;
