import * as yup from "yup";

const addUserSchema = yup.object().shape({
  email: yup.string().email("Must be a valid email").required("Please enter email"),
  password: yup
    .string()
    .required("Please enter password")
    .min(8, "Password is too short")
    .max(20, "Password is too long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*\.])(?=.{8,})/, "Must be a valid password"),
  firstName: yup.string().required("Please enter first name"),
  lastName: yup.string().required("Please enter last name"),
  role: yup.string().required("Please enter role"),
});

export default addUserSchema;
