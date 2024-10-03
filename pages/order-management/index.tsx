/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { FiEdit } from "react-icons/fi";
import { connect } from "react-redux";
import { fetcher, get } from "../../library/apiService";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Pagination from "../../src/components/Pagination";
import Table from "../../src/components/Table/Table";
import { withLoading } from "../../src/components/Loading/withLoading";
import { useRouter } from "next/router";
import { getSocket } from "../../src/services/socket";
import { TiExport } from "react-icons/ti";
import { END_POINTS } from "../../src/constant/endpoints";
import { toast } from "react-toastify";
import { retrieveFileFromS3 } from "../../src/utils/s3File";
import { exportCSVToFile } from "../../src/utils";
import { authorizeFeatures } from "../../src/utils/authorization";
import { useDelaySearch } from "../../src/hooks/useDelaySearch";
import { toLocales } from "../../src/utils/string";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const Orders = ({ user, setLoading }) => {
  const router = useRouter();
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalData, setTotalData] = useState(0);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");
  let userData = [];

  const canCreate = authorizeFeatures(user, 3, 1);
  const canView = authorizeFeatures(user, 3, 2);
  const canUpdate = authorizeFeatures(user, 3, 3);
  const canDelete = authorizeFeatures(user, 3, 4);

  const socket = getSocket();

  let totalPage = Math.ceil(totalData / 10);

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const { search } = useDelaySearch(watch("search"));

  const { data: orderDataResponse, mutate } = useSWR(`/orders?search=${search}&row=10&page=${currentPage}`, fetcher, {
    onSuccess: ({ metadata }) => setTotalData(Math.round(metadata?.total)),
  });

  const renderActions = id => (
    <div className="flex justify-center">
      {canUpdate && (
        <Button
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 py-1 sm:py-2  rounded-md w-8 sm:w-10"
          onClick={() => router.push(`order-management/${id}`)}
          title={<FiEdit size="1.5em" />}
        />
      )}
    </div>
  );

  const columns = [
    {
      field: "orderCode",
      title: toLocales("fe_order_mid_table_order_code"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "subtotal",
      title: toLocales("fe_order_mid_table_subtotal"),
      className: "sm:min-w-[100px] text-center",
    },
    {
      field: "total",
      title: toLocales("fe_order_mid_table_total"),
      className: "sm:min-w-[120px] text-center",
    },
    {
      field: "payment",
      title: toLocales("fe_order_mid_table_payment"),
      className: "sm:min-w-[120px] text-center",
    },
    {
      field: "type",
      title: toLocales("fe_order_mid_table_type"),
      className: "sm:min-w-[120px] text-center",
    },
    {
      field: "createdBy",
      title: toLocales("fe_order_mid_table_created_by"),
      className: "sm:min-w-[140px] text-left",
    },
    {
      field: "actions",
      title: toLocales("fe_order_mid_table_actions"),
      render: renderActions,
      className: "sm:min-w-[100px] text-center",
    },
  ];

  const convertOrderResponseToRow = order => {
    const { subtotal, total, createdUser, kindOfPayment, type, _id } = order;

    return {
      orderCode: _id,
      subtotal: `$ ${subtotal.toFixed(2)}`,
      total: `$ ${total.toFixed(2)}`,
      createdBy: createdUser && `${createdUser?.firstName} ${createdUser?.lastName}`,
      payment: kindOfPayment,
      type,
      actions: _id,
    };
  };

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "orders")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleOrderEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        currentRows.unshift(convertOrderResponseToRow(data));
        setTotalData(totalData + 1);

        if (currentRows?.length > 10) {
          currentRows.pop();
          if (totalPage < 2) totalPage = Math.ceil(totalData / 10) + 1;
        }
        return setRows([...currentRows]);

      case "UPDATE":
        return setRows([...rows.map(row => (row?._id === data?._id ? convertOrderResponseToRow(data) : row))]);

      case "DELETE":
        const newRows = rows.filter(({ _id }) => _id !== data?._id);
        if (newRows?.length === 0) {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }
        setRows([...newRows]);
        return totalPage > 1 ? mutate() : setTotalData(totalData - 1);

      case "DONE":
        const defaultFilename = "orders-" + csvFilename.split("/")[1];
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
      socket.on("orders", data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off("orders");
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleOrderEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => {
    if (orderDataResponse) {
      userData = orderDataResponse?.data?.map(convertOrderResponseToRow);
      setRows(userData);
    }
  }, [orderDataResponse]);

  return (
    <div>
      <div>
        <p className="text-md sm:text-2xl  font-semibold text-gray-600 mb-3 sm:mb-6">
          {toLocales("fe_order_top_title")}
        </p>
        <div className="flex justify-between items-center sm:bg-slate-100 rounded-xl mb-4 sm:p-3">
          <Input
            type="text"
            name="search"
            control={control}
            placeholder={toLocales("fe_order_top_search")}
            className="w-64 hidden sm:inline "
          />
          <Button
            title={
              <span className="flex gap-1 items-center">
                <span>{toLocales("fe_order_top_export")}</span>
                <TiExport size="1.2em" />
              </span>
            }
            onClick={handleClickExport}
            className="text-gray-600 border hover:border-gray-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
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
              {toLocales("fe_order_bottom_total")} {totalData}
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
    </div>
  );
};

Orders.withSidebar = true;

export default connect(mapStateToProps, null)(withLoading(Orders));
