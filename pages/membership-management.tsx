/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { apiDelete, fetcher, get } from "../library/apiService";
import Button from "../src/components/Button";
import Input from "../src/components/Input";
import Pagination from "../src/components/Pagination";
import Table from "../src/components/Table/Table";
import AddMembershipForm from "../src/components/features/Memberships/AddMembership";
import EditMembershipForm from "../src/components/features/Memberships/EditMembership";
import Modal from "../src/components/Modal";
import { withLoading } from "../src/components/Loading/withLoading";
import { AiOutlineDelete } from "react-icons/ai";
import { TiExport } from "react-icons/ti";
import { getSocket } from "../src/services/socket";
import { retrieveFileFromS3 } from "../src/utils/s3File";
import { END_POINTS } from "../src/constant/endpoints";
import { exportCSVToFile } from "../src/utils";
import { authorizeFeatures } from "../src/utils/authorization";
import { useDelaySearch } from "../src/hooks/useDelaySearch";
import { toLocales } from "../src/utils/string";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const Membership = ({ user, setLoading }) => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddMembershipModal, setOpenAddMembershipModal] = useState(false);
  const [openEditMembershipModal, setOpenEditMembershipModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDeletedMembershipsModal, setOpenDeletedMembershipsModal] = useState(false);
  const [selectedMembership, setSelectedMembership] = useState<any>();
  const [totalData, setTotalData] = useState(0);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");

  let membershipData = [];

  const canCreate = authorizeFeatures(user, 6, 1);
  const canView = authorizeFeatures(user, 6, 2);
  const canUpdate = authorizeFeatures(user, 6, 3);
  const canDelete = authorizeFeatures(user, 6, 4);
  const socket = getSocket();

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });

  let totalPage = Math.ceil(totalData / 10);

  const { search } = useDelaySearch(watch("search"));

  const { data: membershipDataResponse, mutate } = useSWR(
    `/memberships?search=${search}&row=10&page=${currentPage}`,
    fetcher,
    {
      onSuccess: ({ metadata }) => setTotalData(Math.round(metadata?.total)),
    }
  );

  const editMembership = user => {
    setSelectedMembership(user);
    setOpenEditMembershipModal(true);
  };

  const openDeleteModalMembership = user => {
    setOpenDeleteModal(true);
    setSelectedMembership(user);
  };

  const deleteMembership = () =>
    apiDelete(`/memberships/${selectedMembership?._id}`, undefined)
      .then(res => {
        toast.success(res.data.message);
        setOpenDeleteModal(false);
      })
      .catch(err => {
        toast.error(err);
        setOpenDeleteModal(false);
      });

  const renderActions = user => (
    <div className="flex justify-center">
      {canUpdate && (
        <Button
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 p-2 rounded-md"
          onClick={() => editMembership(user)}
          title={<FiEdit size="1.4em" />}
        />
      )}
      {canDelete && (
        <Button
          className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 p-2 rounded-md"
          onClick={() => openDeleteModalMembership(user)}
          title={<AiOutlineDelete size="1.55em" />}
        />
      )}
    </div>
  );

  const columns = [
    {
      field: "membershipId",
      title: toLocales("fe_membership_mid_table_membership_id"),
      className: "sm:min-w-[200px] text-left",
    },
    {
      field: "memberPoints",
      title: toLocales("fe_membership_mid_table_points"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "user",
      title: toLocales("fe_membership_mid_table_user"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "actions",
      title: toLocales("fe_membership_mid_table_actions"),
      render: renderActions,
      className: "sm:min-w-[100px] text-center",
    },
  ];

  const convertMembershipResponseToRow = membership => {
    const { membershipId, memberPoints, _id, __v } = membership;
    const user = membership?.user ? `${membership?.user?.firstName} ${membership?.user?.lastName}` : <>&mdash;</>;
    const data = { membershipId, memberPoints, user: membership?.user, _id };

    return {
      ...data,
      user,
      actions: data,
    };
  };

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "memberships")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleMembershipEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        currentRows.unshift(convertMembershipResponseToRow(data));
        setTotalData(totalData + 1);

        if (currentRows?.length > 10) {
          currentRows.pop();
          if (totalPage < 2) totalPage = Math.ceil(totalData / 10) + 1;
        }
        return setRows([...currentRows]);

      case "UPDATE":
        return setRows([...rows.map(row => (row?._id === data?._id ? convertMembershipResponseToRow(data) : row))]);

      case "DELETE":
        const newRows = rows.filter(({ _id }) => _id !== data?._id);
        if (newRows?.length === 0) {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }
        setRows([...newRows]);
        return totalPage > 1 ? mutate() : setTotalData(totalData - 1);

      case "DONE":
        const defaultFilename = "memberships-" + csvFilename.split("/")[1];
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
      socket.on("memberships", data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off("memberships");
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleMembershipEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => {
    if (membershipDataResponse) {
      membershipData = membershipDataResponse?.data?.map(convertMembershipResponseToRow);
      setRows(membershipData);
    }
  }, [membershipDataResponse]);

  return (
    <div>
      <div>
        <p className="text-md sm:text-2xl font-semibold text-gray-600 mb-3 sm:mb-6">
          {toLocales("fe_membership_top_title")}
        </p>
        <div className="flex sm:flex-row-reverse justify-between items-center rounded-xl sm:bg-slate-100 mb-3 sm:p-3">
          <div className="flex sm:flex-row-reverse gap-2 sm:gap-3 ">
            {canCreate && (
              <Button
                title={toLocales("fe_membership_top_add_membership")}
                onClick={() => setOpenAddMembershipModal(true)}
                className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
              />
            )}
            <Button
              title={
                <span className="flex gap-1 items-center">
                  <span>{toLocales("fe_membership_top_export")}</span>
                  <TiExport size="1.2em" />
                </span>
              }
              onClick={handleClickExport}
              className="text-gray-600 border hover:border-gray-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
            />
          </div>
          <Input
            type="text"
            name="search"
            control={control}
            placeholder={toLocales("fe_membership_top_search")}
            className="w-64 hidden sm:inline "
          />
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
        <div className="mt-6 flex items-end justify-between">
          {rows?.length > 0 && (
            <p className="font-semibold text-sm sm:text-lg">
              {toLocales("fe_membership_bottom_total")} {totalData}
            </p>
          )}
          {totalPage > 1 && (
            <div className="flex justify-self-center">
              <Pagination
                className="flex gap-1 sm:gap-3"
                totalPage={totalPage}
                currentPage={currentPage}
                rangePageIndex={3}
                setCurrentPage={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>
      {canCreate && <AddMembershipForm openModal={openAddMembershipModal} setOpenModal={setOpenAddMembershipModal} />}
      {canUpdate && (
        <EditMembershipForm
          openModal={openEditMembershipModal}
          setOpenModal={setOpenEditMembershipModal}
          selectedMembership={selectedMembership}
        />
      )}
      {canDelete && (
        <Modal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          header={`${toLocales("fe_membership_popup_delete")} ${selectedMembership?.membershipId}`}
          className="!max-w-sm"
          body={
            <div className="w-full flex justify-evenly gap-4">
              <Button
                title={toLocales("fe_membership_popup_cancel")}
                className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={() => setOpenDeleteModal(false)}
              />
              <Button
                title={toLocales("fe_membership_popup_delete")}
                className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={deleteMembership}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

Membership.withSidebar = true;

export default connect(mapStateToProps, null)(withLoading(Membership));
