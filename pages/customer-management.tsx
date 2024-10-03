/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import classnames from "classnames";
import useSWR from "swr";
import { FiEdit } from "react-icons/fi";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import { apiDelete, fetcher, get } from "../library/apiService";
import Button from "../src/components/Button";
import Input from "../src/components/Input";
import Pagination from "../src/components/Pagination";
import Table from "../src/components/Table/Table";
import AddCustomerForm from "../src/components/features/Customers/AddCustomer";
import EditCustomerForm from "../src/components/features/Customers/EditCustomer";
import Modal from "../src/components/Modal";
import { AiOutlineDelete } from "react-icons/ai";
import { TiExport } from "react-icons/ti";
import { getSocket } from "../src/services/socket";
import { retrieveFileFromS3 } from "../src/utils/s3File";
import { END_POINTS } from "../src/constant/endpoints";
import { exportCSVToFile } from "../src/utils";
import Stepbar from "../src/components/Stepbar";
import { icons } from "../src/constant/tiers";
import { authorizeFeatures } from "../src/utils/authorization";
import { useDelaySearch } from "../src/hooks/useDelaySearch";
import { toLocales } from "@gf/hermes";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const Customer = ({ user }) => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddCustomerModal, setOpenAddCustomerModal] = useState(false);
  const [openEditCustomerModal, setOpenEditCustomerModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>();
  const [tiers, setTiers] = useState<any>();
  const [totalData, setTotalData] = useState(0);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");

  let customerData = [];

  const canCreate = authorizeFeatures(user, 5, 1);
  const canView = authorizeFeatures(user, 5, 2);
  const canUpdate = authorizeFeatures(user, 5, 3);
  const canDelete = authorizeFeatures(user, 5, 4);
  const socket = getSocket();

  let totalPage = Math.ceil(totalData / 10);

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const { search } = useDelaySearch(watch("search"));

  const { data: customerDataResponse, mutate } = useSWR(
    `/customers?search=${search}&row=10&page=${currentPage}`,
    fetcher,
    {
      onSuccess: ({ metadata }) => setTotalData(Math.round(metadata?.total)),
    }
  );

  const editCustomer = customer => {
    setSelectedCustomer(customer);
    setOpenEditCustomerModal(true);
  };

  const openDeleteModalCustomer = customer => {
    setSelectedCustomer(customer);
    setOpenDeleteModal(true);
  };

  const deleteCustomer = () =>
    apiDelete(`/customers/${selectedCustomer?._id}`, undefined)
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
          onClick={() => editCustomer(user)}
          title={<FiEdit size="1.4em" />}
        />
      )}
      {canDelete && (
        <Button
          className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 p-2 rounded-md"
          onClick={() => openDeleteModalCustomer(user)}
          title={<AiOutlineDelete size="1.55em" />}
        />
      )}
    </div>
  );

  const renderCollapse = (data, tiers) => {
    return (
      <div className="p-3 sm:p-4 flex justify-between gap-4 bg-slate-100 rounded-b-xl mb-2">
        <div className="w-1/2 p-3 sm:p-4 rounded-lg flex flex-col justify-between gap-4 bg-white">
          <div className="w-full">
            <p>
              <span className="text-xs sm:text-base text-gray-600 font-semibold">{data?.name}</span>
              <span className="text-xs sm:text-base text-gray-600 font-semibold">
                {data?.tier?.title && ` (${data?.tier?.title} - ${data?.membership?.totalMemberPoints}p.)`}
              </span>
            </p>
            <div className="w-[40px] mt-1 h-1 bg-green-500"></div>
          </div>
          <Stepbar
            tiers={tiers}
            currentTier={{ title: data?.tier?.title, points: data?.membership?.totalMemberPoints }}
          />
        </div>
        <div className="w-1/2 p-3 sm:p-4 rounded-lg bg-white flex flex-col gap-4 justify-center">
          <div className="w-full">
            <p className="text-xs sm:text-base flex-1 text-gray-600 font-bold">Membership</p>
            <div className="w-[40px] mt-1 h-1 bg-green-500"></div>
          </div>
          <div>
            <div className="flex gap-4">
              <p className="text-xs sm:text-sm flex-1 text-gray-600">Membership ID</p>
              <p className="text-xs sm:text-sm flex-[2] text-gray-600">
                {data?.membership?.membershipId || <>&mdash;</>}
              </p>
            </div>
            <div className="flex gap-4">
              <p className="text-xs sm:text-sm flex-1 text-gray-600">Referral Code</p>
              <p className="text-xs sm:text-sm flex-[2] text-gray-600">{data?.referralCode || <>&mdash;</>}</p>
            </div>
            <div className="flex gap-4">
              <p className="text-xs sm:text-sm flex-1 text-gray-600">Phone Number</p>
              <p className="text-xs sm:text-sm flex-[2] text-gray-600">{data?.phoneNumber || <>&mdash;</>}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTier = tier => (
    <span className={classnames("rounded-lg px-3 py-1 w-16 inline-block text-white", tier?.color)}>{tier?.title}</span>
  );

  const columns = [
    {
      field: "name",
      title: toLocales("fe_customer_mid_table_customer"),
      className: "sm:min-w-[100px] text-left",
    },
    {
      field: "email",
      title: toLocales("fe_customer_mid_table_email"),
      tooltip: true,
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "phoneNumber",
      title: toLocales("fe_customer_mid_table_phone_number"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "tier",
      title: toLocales("fe_customer_mid_table_tier"),
      render: renderTier,
      renderTooltip: tier => tier?.title,
      className: "sm:min-w-[120px] text-center",
    },
    {
      field: "membership",
      title: toLocales("fe_customer_mid_table_membership"),
      render: membership => membership?.membershipId || <>&mdash;</>,
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "actions",
      title: toLocales("fe_customer_mid_table_actions"),
      render: renderActions,
      className: "sm:min-w-[100px] text-center",
    },
  ];

  const convertCustomerResponseToRow = customer => {
    const { email, phoneNumber, firstName, lastName, membership, _id, __v } = customer;
    const name = `${firstName} ${lastName}`;
    const data = {
      email,
      phoneNumber,
      name,
      firstName,
      lastName,
      membership,
      _id,
      tier: membership?.tier,
    };

    return {
      ...data,
      renderCollapse: () => renderCollapse(data, tiers),
      actions: data,
    };
  };

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "customers")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleCustomerEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        currentRows.unshift(convertCustomerResponseToRow(data));
        setTotalData(totalData + 1);

        if (currentRows?.length > 10) {
          currentRows.pop();
          if (totalPage < 2) totalPage = Math.ceil(totalData / 10) + 1;
        }
        return setRows([...currentRows]);

      case "UPDATE":
        return setRows([...rows.map(row => (row?._id === data?._id ? convertCustomerResponseToRow(data) : row))]);

      case "DELETE":
        const newRows = rows.filter(({ _id }) => _id !== data?._id);
        if (newRows?.length === 0) {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }
        setRows([...newRows]);
        return totalPage > 1 ? mutate() : setTotalData(totalData - 1);

      case "DONE":
        const defaultFilename = "customers-" + csvFilename.split("/")[1];
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
    get("/settings/646a3972ad10bd9aedef4406", null)
      .then(response => {
        const { data } = response?.data || {};

        setTiers(
          data?.value
            .sort((curr, next) => curr?.points - next?.points)
            .map(tier => ({ ...tier, icon: icons?.find(item => item?.label === tier?.label)?.icon }))
        );
      })
      .catch(error => {});
  }, []);

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
      socket.on("customers", data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off("customers");
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleCustomerEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => {
    if (customerDataResponse) {
      customerData = customerDataResponse?.data?.map(convertCustomerResponseToRow);
      setRows(customerData);
    }
  }, [customerDataResponse, tiers]);

  return (
    <div>
      <div>
        <p className="text-md sm:text-2xl font-semibold text-gray-600 mb-3 sm:mb-6">
          {toLocales("fe_customer_top_title")}
        </p>
        <div className="flex sm:flex-row-reverse justify-between items-center rounded-xl sm:bg-slate-100 mb-4 sm:p-3">
          <div className="flex sm:flex-row-reverse gap-2 sm:gap-3 ">
            {canCreate && (
              <Button
                title={toLocales("fe_customer_top_add_customer")}
                onClick={() => setOpenAddCustomerModal(true)}
                className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
              />
            )}
            <Button
              title={
                <span className="flex gap-1 items-center">
                  <span>{toLocales("fe_customer_top_export")}</span>
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
            placeholder={toLocales("fe_customer_top_search")}
            className="w-64 hidden sm:inline "
          />
        </div>
        <div className="p-2 sm:p-3 border border-gray-200 rounded sm:rounded-md">
          <div className="overflow-auto w-full">
            {rows?.length > 0 ? (
              <Table rows={rows} columns={columns} className="text-xs sm:text-sm w-full" collapsed />
            ) : (
              <span className="text-gray-400">{toLocales("fe_common_no_data")}</span>
            )}
          </div>
        </div>
        <div className="mt-6 flex items-end justify-between">
          {rows?.length > 0 && (
            <p className="font-semibold text-sm sm:text-lg">
              {toLocales("fe_customer_bottom_total")} {totalData}
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
      {canCreate && <AddCustomerForm openModal={openAddCustomerModal} setOpenModal={setOpenAddCustomerModal} />}
      {canUpdate && openEditCustomerModal && (
        <EditCustomerForm
          openModal={openEditCustomerModal}
          setOpenModal={setOpenEditCustomerModal}
          selectedCustomer={selectedCustomer}
        />
      )}
      {canDelete && (
        <Modal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          header={`Delete ${selectedCustomer?.name}`}
          className="!max-w-sm"
          body={
            <div className="w-full flex justify-evenly gap-4">
              <Button
                title="Cancel"
                className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={() => setOpenDeleteModal(false)}
              />
              <Button
                title="Delete"
                className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={deleteCustomer}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

Customer.withSidebar = true;

export default connect(mapStateToProps, null)(Customer);
