/* eslint-disable react-hooks/exhaustive-deps */
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { put } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import editUserSchema from "./editUserSchema";
import { toLocales } from "../../../../utils/string";

interface EditUserFormProps {
  roles: any;
  openModal: boolean;
  selectedUser: any;
  setOpenModal: (value: boolean) => void;
}

const EditUserForm = ({ roles, openModal, selectedUser, setOpenModal }: EditUserFormProps) => {
  const methods = useForm({
    resolver: yupResolver(editUserSchema),
    mode: "onChange",
    reValidateMode: "onChange",
  });
  const { handleSubmit, setValue, reset } = methods;

  const handleUpdateUser = data => {
    const { email, password, firstName, lastName, active, role } = data;
    const user = { email: selectedUser.email };
    const newUser = {
      email,
      password,
      firstName,
      lastName,
      role,
      isFrozen: !active,
    };

    put("/users", {
      user,
      newUser,
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response.data?.errorMessage));
  };

  const renderEditUserForm = () => (
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
          type: "toggle",
          label: toLocales("fe_user_mid_table_active"),
          name: "active",
          placeholder: "Enter first name",
          className: "mb-2",
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
          title: toLocales("fe_user_mid_popup_update"),
          onClick: handleSubmit(handleUpdateUser),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const editUserFormPopup = {
    header: toLocales("fe_user_mid_table_edit_user"),
    body: renderEditUserForm(),
  };

  useEffect(() => {
    for (let field in selectedUser) {
      setValue(field, selectedUser[field]);
    }
  }, [selectedUser]);

  return (
    <div className="text-sm">
      <Modal
        {...editUserFormPopup}
        open={openModal}
        setOpen={setOpenModal}
        onClose={reset}
        className="text-xs sm:text-sm"
      />
    </div>
  );
};

export default EditUserForm;
