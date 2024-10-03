import * as yup from "yup";

const customerSchema = yup.object().shape({
  email: yup.string().email("Must be a valid email").required("Please enter email"),
  firstName: yup.string().required("Please enter first name"),
  lastName: yup.string().required("Please enter last name"),
  phoneNumber: yup.string(),
  // .matches(/^(\+|\d{1,3})\s?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, "Must a valid phone number"),
  membership: yup.object(),
  // .when("membership", { is: value => !value, then: yup.string().matches(/^[a-zA-Z0-9]+$/, "Must be a valid ID") }),
});

export default customerSchema;
