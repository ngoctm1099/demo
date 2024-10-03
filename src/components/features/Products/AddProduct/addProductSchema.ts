import * as yup from "yup";

const addProductSchema = yup.object().shape({
  file: yup.object().nullable(),
  name: yup.string().required("Enter product name"),
  categories: yup.array().min(1, "Choose at least one category").nullable().required("Choose at least one category"),
  tags: yup.array().min(1, "Choose at least one tag").nullable().required("Choose at least one tag"),
  price: yup
    .string()
    .required("Enter price")
    .matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid price"),
  variants: yup.array(
    yup.object().shape({
      name: yup.string().required("Enter variant name"),
      options: yup.array(
        yup.object().shape({
          image: yup.object().nullable(),
          name: yup.string().required("Enter option name"),
          price: yup
            .string()
            .required("Enter price")
            .matches(/^[0-9]\d*(((,\d{3}){1})?(\.\d{0,2})?)$/, "Must be a valid price"),
        })
      ),
    })
  ),
});

export default addProductSchema;
