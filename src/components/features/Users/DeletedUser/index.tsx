/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { apiDelete, fetcher, put } from "../../../../../library/apiService";
import Modal from "../../../Modal";
import { BsCheckCircleFill, BsXCircleFill } from "react-icons/bs";
import Table from "../../../Table/Table";
import Pagination from "../../../Pagination";
import Button from "../../../Button";
import { toLocales, upperCaseFirstLetterOfEachWord } from "../../../../utils/string";
import { toast } from "react-toastify";
import classNames from "classnames";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";

interface DeletedUsersModalProps {
  openDeletedUserModal: boolean;
  setOpenDeletedUserModal: (value: boolean) => void;
}

const DeletedUsers = ({ openDeletedUserModal, setOpenDeletedUserModal }: DeletedUsersModalProps) => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [selectedUser, setSelectedUser] = useState({ email: undefined });
  const [openRestoreUserModal, setOpenRestoreUserModal] = useState(false);
  const [openDeletePermanentlyUserModal, setOpenDeletePermanentlyUserModal] = useState(false);

  let totalPage = Math.ceil(totalData / 10);
  const { data: deletedUsersResponse, mutate } = useSWR(`/users?row=10&page=${currentPage}&deleted=1`, fetcher, {
    onSuccess: ({ metadata }) => setTotalData(Math.round(metadata?.total)),
  });

  const data = deletedUsersResponse?.data?.map(user => {
    const { email, firstName, lastName, isDeleted } = user;
    const role = upperCaseFirstLetterOfEachWord(user.role?.role);

    return { email, firstName, lastName, isDeleted, role, actions: { isDeleted, email } };
  });

  const renderDeletedStatus = (status: boolean) => (
    <div className="flex justify-center">
      {status ? (
        <BsCheckCircleFill className="text-sky-500" size="1.4em" />
      ) : (
        <BsXCircleFill className="text-red-500" size="1.4em" />
      )}
    </div>
  );

  const renderActions = user => (
    <div className="flex justify-center">
      <Button
        className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 py-2  rounded-md w-8 sm:w-11"
        onClick={() => handleOpenRestoreModal(user)}
        title={<MdOutlineRestore size="1.5em" />}
      />
      <Button
        className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 py-2  rounded-md w-8 sm:w-11"
        onClick={() => handleOpenDeletePermanentlyUser(user)}
        title={<MdDeleteForever size="1.6em" />}
      />
    </div>
  );

  const handleOpenDeletePermanentlyUser = user => {
    setSelectedUser(user);
    setOpenDeletePermanentlyUserModal(true);
  };

  const handleOpenRestoreModal = user => {
    setSelectedUser(user);
    setOpenRestoreUserModal(true);
  };

  const handleRestoreUser = async () => {
    await put("/users", {
      user: { email: selectedUser.email },
      newUser: {
        isDeleted: false,
      },
    })
      .then(res => {
        toast.success(res?.data?.message);
        mutate();
      })
      .catch(err => toast.error(err))
      .finally(() => setOpenRestoreUserModal(false));
  };

  const handleDeletePermanentlyUser = async () => {
    await apiDelete("/users", { email: selectedUser.email, permanentlyDelete: true })
      .then(res => {
        toast.success(res?.data?.message);
        mutate();
      })
      .catch(err => toast.error(err))
      .finally(() => setOpenDeletePermanentlyUserModal(false));
  };

  const columns = [
    {
      field: "email",
      title: toLocales("fe_user_mid_table_email"),
      className: "sm:min-w-[200px] text-left",
    },
    {
      field: "firstName",
      title: toLocales("fe_user_mid_table_first_name"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "lastName",
      title: toLocales("fe_user_mid_table_last_name"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "role",
      title: toLocales("fe_user_mid_table_role"),
      className: "sm:min-w-[100px] text-left",
    },
    {
      field: "isDeleted",
      title: toLocales("fe_user_mid_popup_deleted"),
      className: "sm:min-w-[120px] text-center",
      render: renderDeletedStatus,
    },
    {
      field: "actions",
      title: toLocales("fe_user_mid_table_actions"),
      className: "sm:w-[15%] text-center",
      render: renderActions,
    },
  ];

  useEffect(() => {
    if (data?.length > 0) return setRows(data);
    if (rows?.length === 0) return setCurrentPage(1);
  }, [deletedUsersResponse]);

  return (
    <div className="text-sm">
      <Modal
        header={toLocales("fe_user_top_deleted_users")}
        body={
          <div className="p-2 sm:p-3 border border-gray-200 rounded sm:rounded-md">
            {data?.length > 0 ? (
              <>
                <div className="overflow-auto w-full">
                  <Table rows={rows} columns={columns} className="text-xs sm:text-sm w-full" />
                </div>
                <div className="mt-6 flex items-center gap-4 justify-center flex-col-reverse md:items-end md:flex-row md:justify-between">
                  <p className="font-semibold text-sm sm:text-base">
                    {toLocales("fe_user_bottom_total")} {totalData}
                  </p>
                  {totalPage > 1 && (
                    <div className="flex justify-self-center">
                      <Pagination
                        className="flex gap-1 sm:gap-4"
                        totalPage={totalPage}
                        currentPage={currentPage}
                        rangePageIndex={3}
                        setCurrentPage={setCurrentPage}
                      />
                    </div>
                  )}
                </div>
              </>
            ) : (
              "toLocales('fe_common_no_data')"
            )}
            <Modal
              header={`Restore ${selectedUser.email}?`}
              open={openRestoreUserModal}
              setOpen={setOpenRestoreUserModal}
              className="!max-w-sm"
              body={
                <div className="flex justify-evenly gap-4">
                  <Button
                    title="Cancel"
                    className="text-sky-600 border-2 border-sky-500 mb-4 sm:mb-0 hover:text-sky-800 hover:border-sky-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                    onClick={() => setOpenRestoreUserModal(false)}
                  />
                  <Button
                    title="Restore"
                    className="text-white bg-sky-600 mb-4 sm:mb-0 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                    onClick={handleRestoreUser}
                  />
                </div>
              }
            />
            <Modal
              header={`Delete ${selectedUser.email}?`}
              open={openDeletePermanentlyUserModal}
              setOpen={setOpenDeletePermanentlyUserModal}
              className="!max-w-sm"
              body={
                <div className="flex justify-evenly gap-4">
                  <Button
                    title="Cancel"
                    className="text-red-600 border-2 border-red-600 mb-4 sm:mb-0 hover:text-red-800 hover:border-red-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-36"
                    onClick={() => setOpenDeletePermanentlyUserModal(false)}
                  />
                  <Button
                    title="Permanently Delete"
                    className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                    onClick={handleDeletePermanentlyUser}
                  />
                </div>
              }
            />
          </div>
        }
        open={openDeletedUserModal}
        setOpen={setOpenDeletedUserModal}
        className={classNames("text-xs sm:text-sm", {
          "!max-w-5xl": data?.length > 0,
        })}
      />
    </div>
  );
};

export default DeletedUsers;
