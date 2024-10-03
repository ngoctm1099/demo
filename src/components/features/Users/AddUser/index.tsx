import React from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { post } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import addUserSchema from "./addUserSchema";
import { toLocales } from "@gf/hermes";

interface AddUserFormProps {
  roles: any;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const AddUserForm = ({ roles, openModal, setOpenModal }: AddUserFormProps) => {
  const methods = useForm({
    resolver: yupResolver(addUserSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "",
    },
  });
  const { handleSubmit, reset } = methods;

  const handleAddUser = data =>
    post("/users", { ...data })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response.data?.errorMessage));

  const renderAddUserForm = () => (
    <Form
      inputs={[
        {
          type: "email",
          label: toLocales("fe_user_mid_table_email"),
          name: "email",
          placeholder: toLocales("fe_user_mid_popup_enter_email"),
          className: "mb-4",
        },
        {
          type: "password",
          label: toLocales("fe_user_mid_popup_password"),
          name: "password",
          placeholder: toLocales("fe_user_mid_popup_enter_password"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_user_mid_table_first_name"),
          name: "firstName",
          placeholder: toLocales("fe_user_mid_popup_enter_first_name"),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_user_mid_table_last_name"),
          name: "lastName",
          placeholder: toLocales("fe_user_mid_popup_enter_last_name"),
          className: "mb-4",
        },
        {
          type: "select",
          label: toLocales("fe_user_mid_table_role"),
          options: roles?.map(({ role }) => ({ value: role })),
          keyValue: "value",
          keyText: "value",
          name: "role",
          placeholder: toLocales("fe_user_mid_popup_select_role"),
          className: "mb-8",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_user_mid_popup_add"),
          onClick: handleSubmit(handleAddUser),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addUserFormPopup = {
    header: toLocales("fe_user_top_add_user"),
    body: renderAddUserForm(),
  };
  return (
    <div className="text-sm">
      <Modal
        {...addUserFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default AddUserForm;
