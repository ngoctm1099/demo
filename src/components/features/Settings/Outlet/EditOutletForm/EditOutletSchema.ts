import * as yup from "yup";

const editOutletSchema = yup.object().shape({
  name: yup.string().required("Enter name"),
  address: yup.string().required("Enter address"),
  outletManagers: yup.string(),
  startOperatingHours: yup
    .string()
    .required("Enter start operating hours")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be a valid time"),
  endOperatingHours: yup
    .string()
    .required("Enter end operating hours")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, "Must be a valid time"),
});

export default editOutletSchema;
