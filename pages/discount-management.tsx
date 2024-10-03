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
import AddDiscountForm from "../src/components/features/Discounts/AddDiscount";
import EditDiscountForm from "../src/components/features/Discounts/EditDiscount";
import Modal from "../src/components/Modal";
import { withLoading } from "../src/components/Loading/withLoading";
import { AiOutlineDelete } from "react-icons/ai";
import { format } from "date-fns";
import { DATE_FORMAT } from "../src/constant/dateFormat";
import { getSocket } from "../src/services/socket";
import { TiExport } from "react-icons/ti";
import { END_POINTS } from "../src/constant/endpoints";
import { retrieveFileFromS3 } from "../src/utils/s3File";
import { exportCSVToFile } from "../src/utils";
import { authorizeFeatures } from "../src/utils/authorization";
import { useDelaySearch } from "../src/hooks/useDelaySearch";
import { toLocales } from "../src/utils/string";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const Discounts = ({ user, setLoading }) => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [openAddDiscountModal, setOpenAddDiscountModal] = useState(false);
  const [openEditDiscountModal, setOpenEditDiscountModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<any>();
  const [totalData, setTotalData] = useState(0);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");
  let userData = [];

  const canCreate = authorizeFeatures(user, 4, 1);
  const canView = authorizeFeatures(user, 4, 2);
  const canUpdate = authorizeFeatures(user, 4, 3);
  const canDelete = authorizeFeatures(user, 4, 4);
  const socket = getSocket();

  let totalPage = Math.ceil(totalData / 10);

  const { control, watch } = useForm({
    defaultValues: {
      search: "",
    },
  });

  const { search } = useDelaySearch(watch("search"));

  const { data: discountDataResponse, mutate } = useSWR(
    `/discounts?search=${search}&row=10&page=${currentPage}`,
    fetcher,
    {
      onSuccess: ({ metadata }) => setTotalData(Math.round(metadata?.total)),
    }
  );

  const editDiscount = discount => {
    setSelectedDiscount(discount);
    setOpenEditDiscountModal(true);
  };

  const openDeleteModalDiscount = discount => {
    setOpenDeleteModal(true);
    setSelectedDiscount(discount);
  };

  const deleteDiscount = () =>
    apiDelete("/discounts", { _id: selectedDiscount?._id })
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
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 py-1 sm:py-2 rounded-md w-8 sm:w-10"
          onClick={() => editDiscount(user)}
          title={<FiEdit size="1.5em" />}
        />
      )}
      {canDelete && (
        <Button
          className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 py-1 sm:py-2 rounded-md w-8 sm:w-10"
          onClick={() => openDeleteModalDiscount(user)}
          title={<AiOutlineDelete size="1.55em" />}
        />
      )}
    </div>
  );

  const columns = [
    {
      field: "name",
      title: toLocales("fe_discount_mid_table_name"),
      className: "sm:min-w-[80px] text-left",
    },
    {
      field: "type",
      title: toLocales("fe_discount_mid_table_type"),
      className: "sm:min-w-[80px] text-left",
    },
    {
      field: "amount",
      title: toLocales("fe_discount_mid_table_amount"),
      className: "sm:min-w-[100px] text-center",
    },
    {
      field: "startDate",
      title: toLocales("fe_discount_mid_table_start_date"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "endDate",
      title: toLocales("fe_discount_mid_table_end_date"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "quantity",
      title: toLocales("fe_discount_mid_table_quantity"),
      className: "sm:min-w-[100px] text-center",
    },
    {
      field: "promoCode",
      title: toLocales("fe_discount_mid_table_promo_code"),
      className: "sm:min-w-[100px] text-left",
    },
    {
      field: "actions",
      title: toLocales("fe_discount_mid_table_actions"),
      render: renderActions,
      className: "sm:min-w-[100px] text-center",
    },
  ];

  const convertDiscountResponseToRow = discount => ({
    ...discount,
    startDate: discount?.startDate && format(new Date(discount.startDate), DATE_FORMAT.DD_MMM_YYYY),
    endDate: discount?.endDate && format(new Date(discount.endDate), DATE_FORMAT.DD_MMM_YYYY),
    actions: discount,
  });

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "discounts")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleDiscountEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        currentRows.unshift(convertDiscountResponseToRow(data));
        setTotalData(totalData + 1);

        if (currentRows?.length > 10) {
          currentRows.pop();
          if (totalPage < 2) totalPage = Math.ceil(totalData / 10) + 1;
        }
        return setRows([...currentRows]);

      case "UPDATE":
        return setRows([...rows.map(row => (row?._id === data?._id ? convertDiscountResponseToRow(data) : row))]);

      case "DELETE":
        const newRows = rows.filter(({ _id }) => _id !== data?._id);
        if (newRows?.length === 0) {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }
        setRows([...newRows]);
        return totalPage > 1 ? mutate() : setTotalData(totalData - 1);

      case "DONE":
        const defaultFilename = "discounts-" + csvFilename.split("/")[1];
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
      socket.on("discounts", data => setDataSocket(data));
    }

    return () => {
      if (socket) socket.off("discounts");
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleDiscountEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => {
    if (discountDataResponse) {
      userData = discountDataResponse?.data?.map(convertDiscountResponseToRow);
      setRows(userData);
    }
  }, [discountDataResponse]);

  return (
    <div>
      <div>
        <p className="text-md sm:text-2xl  font-semibold text-gray-600 mb-3 sm:mb-6">
          {toLocales("fe_discount_top_title")}
        </p>
        <div className="flex justify-between items-end sm:bg-slate-100 rounded-xl mb-4 sm:p-3">
          <Input
            type="text"
            name="search"
            control={control}
            placeholder={toLocales("fe_discount_top_search")}
            className="w-64 hidden sm:inline "
          />
          <div className="flex sm:flex-row-reverse gap-2 sm:gap-3">
            {canCreate && (
              <Button
                title={toLocales("fe_discount_top_add_discount")}
                onClick={() => setOpenAddDiscountModal(true)}
                className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
              />
            )}
            <Button
              title={
                <span className="flex gap-1 items-center">
                  <span>{toLocales("fe_discount_top_export")}</span>
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
        <div className="mt-6 flex items-end justify-between">
          {rows?.length > 0 && (
            <p className="font-semibold text-sm sm:text-lg">
              {toLocales("fe_discount_bottom_total")} {totalData}
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
      {canCreate && <AddDiscountForm openModal={openAddDiscountModal} setOpenModal={setOpenAddDiscountModal} />}
      {canUpdate && (
        <EditDiscountForm
          openModal={openEditDiscountModal}
          setOpenModal={setOpenEditDiscountModal}
          selectedDiscount={selectedDiscount}
        />
      )}
      {canDelete && (
        <Modal
          open={openDeleteModal}
          setOpen={setOpenDeleteModal}
          header={`${toLocales("fe_discount_popup_delete")} ${selectedDiscount?._id}`}
          className="!max-w-sm"
          body={
            <div className="w-full flex justify-evenly gap-4">
              <Button
                title={toLocales("fe_discount_popup_cancel")}
                className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={() => setOpenDeleteModal(false)}
              />
              <Button
                title={toLocales("fe_discount_popup_delete")}
                className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                onClick={deleteDiscount}
              />
            </div>
          }
        />
      )}
    </div>
  );
};

Discounts.withSidebar = true;

export default connect(mapStateToProps, null)(withLoading(Discounts));
