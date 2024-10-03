import React from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { post } from "../../../../../library/apiService";
import { moduleNames, roleDefaultValues, RoleInputs, roleMapping } from "../../../../constant/defaultValues";
import Button from "../../../Button";
import Checkbox from "../../../Checkbox";
import Input from "../../../Input";
import Modal from "../../../Modal";
import Table from "../../../Table/Table";
import { toLocales } from "@gf/hermes";

interface AddRoleFormProps {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const AddRoleForm = ({ open, setOpen }: AddRoleFormProps) => {
  const methods = useForm({
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: roleDefaultValues,
  });
  const { handleSubmit, control, setValue, watch } = methods;

  const rows = Object.values(roleMapping).map(({ label, roleActions }) => ({
    name: label,
    selectAll: { label, roleActions },
    enable: { name: roleActions[0], label, roleActions },
    create: { name: roleActions[1], label, roleActions },
    view: { name: roleActions[2], label, roleActions },
    update: { name: roleActions[3], label, roleActions },
    delete: { name: roleActions[4], label, roleActions },
  }));

  const handleCheckboxAfterClick = (label, roleActions) => {
    const isSelectedAll = roleActions.map(role => watch(role)).every(value => value);
    setValue(label, isSelectedAll);
  };

  const renderCheckboxRole = ({ name, label, roleActions }) => (
    <div className="flex justify-center py-2">
      <Checkbox
        name={name}
        control={control as Control<unknown, any>}
        onAfterClick={() => handleCheckboxAfterClick(label, roleActions)}
      />
    </div>
  );

  const handleSelectAll = (checked, roleActions) => roleActions.forEach(role => setValue(role, checked));

  const renderCheckboxAll = ({ label, roleActions }) => {
    return (
      <div className="flex justify-center py-2">
        <Checkbox
          name={label}
          control={control as Control<unknown, any>}
          onAfterClick={checked => handleSelectAll(checked, roleActions)}
        />
      </div>
    );
  };

  const columns = [
    {
      field: "name",
      title: " ",
      className: "sm:min-w-[80px] text-left",
    },
    {
      field: "selectAll",
      title: toLocales("fe_role_mid_popup_select_all"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxAll,
    },
    {
      field: "enable",
      title: toLocales("fe_role_mid_popup_enable"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxRole,
    },
    {
      field: "create",
      title: toLocales("fe_role_mid_popup_create"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxRole,
    },
    {
      field: "view",
      title: toLocales("fe_role_mid_popup_view"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxRole,
    },
    {
      field: "update",
      title: toLocales("fe_role_mid_popup_update"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxRole,
    },
    {
      field: "delete",
      title: toLocales("fe_role_mid_popup_delete"),
      className: "sm:min-w-[80px] text-center",
      render: renderCheckboxRole,
    },
  ];

  const handleAddingRole = async ({ role }) => {
    const roleValues = Object.values(roleMapping)
      .map(({ roleActions }) => roleActions)
      .map(roleAction => roleAction.reduce((prev, next) => prev + (watch(next as keyof RoleInputs) ? "1" : "0"), ""));

    return await post("/roles", {
      role,
      moduleNames,
      roleValues,
    })
      .then(res => {
        const { message } = res.data;
        toast.success(message);
        setOpen(false);
      })
      .catch(err => toast.error(err));
  };

  const roleSelectionTable = (
    <div className="text-xs sm:text-sm">
      <Input name="role" type="text" control={control} label="Name" placeholder="Enter name" className="mb-4" />
      <div className="p-2 border border-gray-200 rounded sm:rounded-md">
        <div className="overflow-auto w-full">
          <Table rows={rows} columns={columns} className="w-full" />
        </div>
      </div>
      <Button
        className="text-white bg-sky-600 mt-8 mb-4 sm:mb-0 hover:bg-sky-700 rounded-md text-md tracking-wider h-10 w-full"
        title={toLocales("fe_role_mid_popup_add")}
        onClick={handleSubmit(handleAddingRole)}
      />
    </div>
  );

  return (
    <Modal
      open={open}
      setOpen={setOpen}
      header={toLocales("fe_role_top_add_role")}
      className="!max-w-3xl"
      body={roleSelectionTable}
    />
  );
};

export default AddRoleForm;
