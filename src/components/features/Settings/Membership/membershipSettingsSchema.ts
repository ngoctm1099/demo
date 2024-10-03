import * as yup from "yup";

const membershipSettingsSchema = yup.object().shape({
  unit: yup.string().matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid unit"),
  points: yup.string().matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid points"),
  newTitle: yup.string(),
  newPoints: yup.string().matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid points"),
});

export default membershipSettingsSchema;
