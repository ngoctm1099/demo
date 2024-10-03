/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { put } from "../../../../../library/apiService";
import Form from "../../../Form";
import Modal from "../../../Modal";
import membershipSchema from "../membershipSchema";
import { defaultMembership, MembershipProps } from "../../../../constant/defaultValues";
import { toLocales } from "../../../../utils/string";

interface EditMembershipFormProps {
  selectedMembership: any;
  openModal: boolean;
  setOpenModal: (value: boolean) => void;
}

const EditMembershipForm = ({ selectedMembership, openModal, setOpenModal }: EditMembershipFormProps) => {
  const methods = useForm({
    resolver: yupResolver(membershipSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: defaultMembership,
  });
  const { handleSubmit, reset, setValue } = methods;

  const handleEditMembership = data =>
    put(`/memberships/${selectedMembership?._id}`, {
      ...data,
      user: null,
    })
      .then(res => {
        const { message } = res.data || {};
        toast.success(message);
        setOpenModal(false);
      })
      .catch(error => toast.error(error.response?.data?.errorMessage));

  const renderEditMembershipForm = () => (
    <Form
      inputs={[
        {
          type: "text",
          label: toLocales("fe_membership_popup_membership_id"),
          name: "membershipId",
          placeholder: toLocales("fe_membership_popup_enter_membership_id"),
          onAfterChange: (e, onChange) =>
            onChange({ ...e, target: { ...e.target, value: e.target.value?.toUpperCase() } }),
          className: "mb-4",
        },
        {
          type: "text",
          label: toLocales("fe_membership_popup_points"),
          name: "memberPoints",
          placeholder: toLocales("fe_membership_popup_enter_points"),
          className: "mb-4",
        },
      ]}
      btns={[
        {
          title: toLocales("fe_membership_popup_update"),
          onClick: handleSubmit(handleEditMembership),
          className:
            "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-sm px-5 py-2.5 mr-2 mb-2",
        },
      ]}
      methods={methods}
    />
  );

  const addUserFormPopup = {
    header: toLocales("fe_membership_popup_edit"),
    body: renderEditMembershipForm(),
  };

  useEffect(() => {
    for (let field in selectedMembership) {
      setValue(field as keyof MembershipProps, selectedMembership[field]);
    }
  }, [selectedMembership]);

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

export default EditMembershipForm;
