import * as yup from "yup";

const editUserSchema = yup.object().shape({
  email: yup.string().email("Must be a valid email").required("Please enter email"),
  password: yup.string(),
  firstName: yup.string().required("Please enter first name"),
  lastName: yup.string().required("Please enter last name"),
  active: yup.boolean(),
  role: yup.string().required("Please enter role"),
});

export default editUserSchema;
