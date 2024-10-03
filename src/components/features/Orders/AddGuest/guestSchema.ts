import * as yup from "yup";

const guestSchema = yup.object().shape({
  email: yup.string().email("Must be a valid email").required("Please enter email"),
  firstName: yup.string(),
  lastName: yup.string(),
  phoneNumber: yup.string(),
  // .matches(/^(\+|\d{1,3})\s?\(?\d{1,3}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/, "Must a valid phone number"),
});

export default guestSchema;
