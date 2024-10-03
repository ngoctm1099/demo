/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import useSWR from "swr";
import { connect } from "react-redux";
import Button from "../../src/components/Button";
import Input from "../../src/components/Input";
import Table from "../../src/components/Table/Table";
import { apiDelete, fetcher, get } from "../../library/apiService";
import Pagination from "../../src/components/Pagination";
import { retrieveFileFromS3 } from "../../src/utils/s3File";
import Image from "next/image";
import { FiEdit } from "react-icons/fi";
import { AiOutlineDelete } from "react-icons/ai";
import Modal from "../../src/components/Modal";
import { toast } from "react-toastify";
import { exportCSVToFile, Uint8ArrayToBlob } from "../../src/utils";
import { getSocket } from "../../src/services/socket";
import { TiExport } from "react-icons/ti";
import { END_POINTS } from "../../src/constant/endpoints";
import { authorizeFeatures } from "../../src/utils/authorization";
import { useDelaySearch } from "../../src/hooks/useDelaySearch";
import { toLocales } from "../../src/utils/string";

const mapStateToProps = state => ({ user: state.userReducers.user });

const ProductManagement = ({ user }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProduct, setTotalProduct] = useState(0);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>();
  const [rows, setRows] = useState([]);
  const [dataSocket, setDataSocket] = useState<any>();
  const [csvFilename, setCsvFilename] = useState("");

  const { control, watch } = useForm({ defaultValues: { search: "" } });

  const router = useRouter();

  const { search } = useDelaySearch(watch("search"));

  const { data: productDataResponse, mutate } = useSWR(
    `/products?search=${search}&row=10&page=${currentPage}`,
    fetcher,
    {
      onSuccess: ({ metadata }) => setTotalProduct(metadata?.total),
    }
  );

  let totalPage = Math.ceil(totalProduct / 10);

  const canCreate = authorizeFeatures(user, 2, 1);
  const canView = authorizeFeatures(user, 2, 2);
  const canUpdate = authorizeFeatures(user, 2, 3);
  const canDelete = authorizeFeatures(user, 2, 4);
  const socket = getSocket();

  const renderImage = image => (
    <div className="relative w-12 h-12 rounded-md overflow-hidden flex items-center justify-center text-center">
      {image ? (
        <Image src={image} alt={image} fill />
      ) : (
        <div className="text-xs bg-gray-200 w-full h-full flex items-center justify-center">Empty</div>
      )}
    </div>
  );

  const deleteProduct = () =>
    apiDelete("/products", {
      _id: selectedProduct?._id,
    })
      .then(res => toast.success(res?.data?.message))
      .catch(err => toast.error(err))
      .finally(() => setOpenDeleteModal(false));

  const openDeleteProductModal = product => {
    setSelectedProduct(product);
    setOpenDeleteModal(true);
  };

  const renderActions = product => (
    <div className="flex justify-center">
      {canUpdate && (
        <Button
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 py-1 sm:py-2  rounded-md w-8 sm:w-10"
          onClick={() => router.push(`product-management/${product?._id}`)}
          title={<FiEdit size="1.5em" />}
        />
      )}
      {canDelete && (
        <Button
          className="hover:bg-rose-100 text-rose-600 hover:text-rose-700 hover:border-rose-600 py-1 sm:py-2  rounded-md w-8 sm:w-10"
          onClick={() => openDeleteProductModal(product)}
          title={<AiOutlineDelete size="1.55em" />}
        />
      )}
    </div>
  );

  const columns = [
    {
      field: "image",
      title: toLocales("fe_product_mid_table_image"),
      className: "sm:min-w-[80px] text-left",
      render: renderImage,
    },
    {
      field: "name",
      title: toLocales("fe_product_mid_table_name"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "categories",
      title: toLocales("fe_product_mid_table_categories"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "price",
      title: toLocales("fe_product_mid_table_price"),
      className: "sm:min-w-[100px] text-left",
    },
    // {
    //   field: "quantity",
    //   title: "Quantity",
    //   className: "sm:min-w-[100px] text-left",
    // },
    {
      field: "action",
      title: toLocales("fe_product_mid_table_actions"),
      className: "sm:min-w-[150px] text-center",
      render: renderActions,
    },
  ];

  const convertDataSocketToRow = async ({ _id, name, image, categories, price }) =>
    await retrieveFileFromS3({ Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME, Key: image })
      .then(imageFile => ({
        _id,
        name,
        image: Uint8ArrayToBlob(imageFile?.Body) || null,
        categories: categories?.join(", "),
        price: `$ ${price?.toFixed(2)}`,
        action: { _id, name },
      }))
      .catch(() => ({
        _id,
        name,
        image: null,
        categories: categories?.join(", "),
        price: `$ ${price?.toFixed(2)}`,
        action: { _id, name },
      }));

  const handleClickExport = async () =>
    await get(END_POINTS.EXPORT_CSV, END_POINTS.COLLECTION_NAME + "products")
      .then(({ data }) => setCsvFilename(data?.fileName))
      .catch(err => toast.error(err.message));

  const handleProductEvents = async dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const currentRows = rows;
        await convertDataSocketToRow(data).then(dt => currentRows.unshift(dt));
        setTotalProduct(totalProduct + 1);

        if (currentRows?.length > 10) {
          currentRows.pop();
          totalPage = Math.ceil(totalProduct / 10) + 1;
        }

        return setRows([...currentRows]);

      case "UPDATE":
        const updatedData = await convertDataSocketToRow(data);
        return setRows([...rows.map(row => (row?._id === data?._id ? updatedData : row))]);

      case "DELETE":
        const newRows = rows.filter(({ _id }) => _id !== data?._id);
        if (newRows?.length === 0) {
          if (currentPage > 1) setCurrentPage(currentPage - 1);
        }
        setRows([...newRows]);
        return totalPage > 1 ? mutate() : setTotalProduct(totalProduct - 1);

      case "DONE":
        const defaultFilename = "products-" + csvFilename.split("/")[1];
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
      socket.on("products", data => setDataSocket(data));

      return () => {
        if (socket) socket.off("products");
      };
    }
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      handleProductEvents(dataSocket);
    }
  }, [dataSocket]);

  useEffect(() => {
    if (productDataResponse?.data) {
      const convertResponseToProductRows = async () => {
        const productRows = productDataResponse?.data?.map(convertDataSocketToRow);
        return await Promise.all(productRows);
      };

      convertResponseToProductRows().then(productRows => setRows(productRows));
    }
  }, [productDataResponse]);

  return (
    <div>
      <p className="text-md sm:text-2xl  font-semibold text-gray-600 mb-3 sm:mb-6">
        {toLocales("fe_product_top_title")}
      </p>
      <div
        className={classNames("flex items-end sm:bg-slate-100 rounded-xl mb-4 sm:p-3", {
          "justify-between": canCreate,
          "justify-end": !canCreate,
        })}
      >
        <Input
          type="text"
          name="search"
          control={control}
          placeholder={toLocales("fe_product_top_search")}
          className="w-64 hidden sm:inline "
        />
        <div className="flex gap-2 sm:gap-3 sm:flex-row-reverse">
          {canCreate && (
            <Button
              title={toLocales("fe_product_top_add_product")}
              onClick={() => router.push("product-management/add")}
              className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider px-4 py-2"
            />
          )}
          <Button
            title={
              <span className="flex gap-1 items-center">
                <span>{toLocales("fe_product_top_export")}</span>
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
            {toLocales("fe_product_bottom_table_total")} {totalProduct || 0}
          </p>
        )}
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
      <Modal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        header={`Delete ${selectedProduct?.name}?`}
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
              onClick={deleteProduct}
            />
          </div>
        }
      />
    </div>
  );
};
ProductManagement.withSidebar = true;

export default connect(mapStateToProps, null)(ProductManagement);
