/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import classnames from "classnames";
import { useForm } from "react-hook-form";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import { apiDelete, get, put } from "../library/apiService";
import Button from "../src/components/Button";
import AddRoleForm from "../src/components/features/Roles/AddRole";
import EditRoleForm from "../src/components/features/Roles/EditRole";
import Input from "../src/components/Input";
import { withLoading } from "../src/components/Loading/withLoading";
import Modal from "../src/components/Modal";
import Select from "../src/components/Select";
import Table from "../src/components/Table/Table";
import useRoles from "../src/hooks/useRoles";
import { getSocket } from "../src/services/socket";
import { TiExport } from "react-icons/ti";
import { retrieveFileFromS3 } from "../src/utils/s3File";
import { exportCSVToFile } from "../src/utils";
import { END_POINTS } from "../src/constant/endpoints";
import { authorizeFeatures } from "../src/utils/authorization";
import { toLocales } from "@gf/hermes";

const mapStateToProps = state => ({ user: state.userReducers.user });

const Roles = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [openAddRoleForm, setOpenAddRoleForm] = useState(false);
  const [openEditRoleForm, setOpenEditRoleForm] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(undefined);
  const [movedRole, setMovedRole] = useState(false);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");
  const { control, watch } = useForm({
    shouldUnregister: true,
    defaultValues: {
      search: "",
      roleMoving: "",
    },
  });
  const { roles, mutateRoles } = useRoles(watch("search"));

  const canCreate = authorizeFeatures(user, 1, 1);
  const canView = authorizeFeatures(user, 1, 2);
  const canUpdate = authorizeFeatures(user, 1, 3);
  const canDelete = authorizeFeatures(user, 1, 4);
  const { roleMoving } = watch();
  const socket = getSocket();

  const renderActions = data => (
    <div className="flex justify-center">
      {canUpdate && (
        <Button
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 p-2 rounded-md"
          onClick={() => {
            setSelectedRole(data);
            setOpenEditRoleForm(true);
          }}
          title={<FiEdit size="1.5em" />}
        />
      )}
      {canDelete && (
        <Button
          className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 p-2 rounded-md"
          onClick={() => {
            setSelectedRole(data);
            setOpenDeleteModal(true);
          }}
          title={<AiOutlineDelete size="1.65em" />}
        />
      )}
    </div>
  );

  const sumRoleValues = roleValues => {
    let sum = 0;
    for (let i = 0; i < roleValues.length; i++) {
      for (let j = 0; j < roleValues[i].length; j++) {
        if (roleValues[i][j] == "1") {
          sum++;
        }
      }
    }
    return sum;
  };

  const moveRole = () =>
    put("/users/roles", {
      role: selectedRole?._id,
      newRole: roleMoving,
    })
      .then(res => {
        toast.success(res.data?.message);
        setMovedRole(true);
      })
      .catch(err => toast.error(err.response.data?.errorMessage));

  const deleteRole = () =>
    apiDelete("/roles", {
      role: selectedRole?.role,
    })
      .then(res => {
        const { message } = res.data;
        toast.success(message);
      })
      .catch(err => toast.error(err))
      .finally(() => setOpenDeleteModal(false));

  const convertRoleResponseToRow = row => ({
    name: row?.role,
    role: sumRoleValues(row?.roleValues),
    associatedAccounts: row?.associatedAccounts,
    _id: row?._id,
    action: { _id: row?._id, role: row?.role, roleActions: row?.roleValues },
  });

  const columns = [
    {
      field: "name",
      title: toLocales("fe_role_mid_table_name"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "role",
      title: toLocales("fe_role_mid_table_role_actions"),
      className: "sm:min-w-[200px] text-center",
    },
    {
      field: "associatedAccounts",
      title: toLocales("fe_role_mid_table_associated_accounts"),
      className: "sm:min-w-[300px] text-center",
    },
    {
      field: "action",
      title: toLocales("fe_role_mid_table_action"),
      className: "sm:min-w-[150px] text-center",
      render: renderActions,
    },
  ];

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "roles")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleRoleEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        currentRows.unshift(convertRoleResponseToRow(data));
        return setRows([...currentRows]);
      case "UPDATE":
        return setRows([...rows.map(row => (row?._id === data?._id ? convertRoleResponseToRow(data) : row))]);
      case "DELETE":
        return setRows([...rows.filter(({ email }) => email !== data?.email)]);
      case "DONE":
        const defaultFilename = "roles-" + csvFilename.split("/")[1];
        return await retrieveFileFromS3({
          Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME,
          Key: csvFilename,
        })
          .then(csvResponse => exportCSVToFile(csvResponse?.Body, defaultFilename))
          .catch(err => toast.error(err.response?.data?.errorMessage));

      default:
        break;
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on(csvFilename, data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off(csvFilename);
    };
  }, [csvFilename]);

  useEffect(() => {
    if (socket) {
      socket.on("roles", data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off("roles");
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleRoleEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => setMovedRole(false), [roleMoving]);

  useEffect(() => setRows([...roles?.map(convertRoleResponseToRow)]), [roles]);

  return (
    <div>
      <p className="text-md sm:text-2xl  font-semibold text-gray-600 mb-3 sm:mb-6">{toLocales("fe_role_top_title")}</p>
      <div
        className={classnames("flex items-end sm:bg-slate-100 rounded-xl mb-4 sm:p-3", {
          "justify-between": canCreate,
          "justify-end": !canCreate,
        })}
      >
        <Input
          type="text"
          name="search"
          control={control}
          placeholder={toLocales("fe_role_top_search")}
          className="w-64 hidden sm:inline"
        />
        <div className="flex gap-2 sm:gap-3 sm:flex-row-reverse">
          {canCreate && (
            <Button
              title={toLocales("fe_role_top_add_role")}
              onClick={() => setOpenAddRoleForm(true)}
              className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
            />
          )}
          <Button
            title={
              <span className="flex gap-1 items-center">
                <span>{toLocales("fe_role_top_export")}</span>
                <TiExport size="1.2em" />
              </span>
            }
            onClick={handleClickExport}
            className="text-gray-600 border hover:border-gray-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
          />
        </div>
      </div>
      <div className="p-2 sm:p-3 border border-gray-200 rounded sm:rounded-md">
        <div className="overflow-auto w-full">
          {rows?.length > 0 ? (
            <Table rows={rows} columns={columns} className="text-xs sm:text-sm w-full" />
          ) : (
            <span className="text-gray-400">{toLocales("fe_common_no_data")}</span>
          )}
        </div>
      </div>
      {openAddRoleForm && <AddRoleForm open={openAddRoleForm} setOpen={setOpenAddRoleForm} />}
      {openEditRoleForm && (
        <EditRoleForm open={openEditRoleForm} setOpen={setOpenEditRoleForm} selectedRole={selectedRole} />
      )}
      <Modal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        header={`${toLocales("fe_role_mid_popup_delete")} ${selectedRole?.role}?`}
        className="!max-w-sm"
        body={
          <div>
            <div className="flex justify-between gap-4 items-end mb-6 text-xs sm:text-sm">
              <Select
                name="roleMoving"
                label={toLocales("fe_role_mid_popup_move_associated_accounts_to")}
                placeholder={toLocales("fe_role_mid_popup_select_role")}
                control={control}
                options={roles
                  ?.map(({ _id, role }) => ({
                    value: _id,
                    text: role,
                  }))
                  ?.filter(({ text }) => text !== selectedRole?.role)}
                keyText="text"
                keyValue="value"
                className="w-96"
              />
              {roleMoving && (
                <Button
                  title="Move"
                  disabled={movedRole}
                  className="bg-sky-600 text-white mb-1 font-medium rounded-md h-10 w-28 hover:bg-sky-700"
                  onClick={moveRole}
                />
              )}
            </div>
            <div className="w-full flex justify-evenly gap-4">
              <Button
                title={toLocales("fe_role_mid_popup_cancel")}
                className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={() => setOpenDeleteModal(false)}
              />
              <Button
                title={toLocales("fe_role_mid_popup_delete")}
                className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={deleteRole}
              />
            </div>
          </div>
        }
      />
    </div>
  );
};

Roles.withSidebar = true;

export default connect(mapStateToProps, null)(withLoading(Roles));
