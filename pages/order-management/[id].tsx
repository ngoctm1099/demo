/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import useSWR from "swr";
import { fetcher, get, put } from "../../library/apiService";
import { format } from "date-fns";
import Card from "../../src/components/Card";
import { DATE_FORMAT } from "../../src/constant/dateFormat";
import { withLoading } from "../../src/components/Loading/withLoading";
import { retrieveFileFromS3 } from "../../src/utils/s3File";
import { Uint8ArrayToBlob } from "../../src/utils";
import Table from "../../src/components/Table/Table";
import Image from "next/image";
import Button from "../../src/components/Button";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { connect } from "react-redux";
import UnderlineInput from "../../src/components/Input/UnderlineInput";
import DeleteGuestModal from "../../src/components/features/Orders/DeleteGuest";
import AddGuestForm from "../../src/components/features/Orders/AddGuest";
import { toLocales } from "../../src/utils/string";

const mapStateToProps = state => ({ user: state.userReducers.user, socket: state.socketReducers });

const OrderId = ({ setLoading, user }) => {
  const router = useRouter();
  const { id } = router.query;
  const [orderData, setOrderData] = useState<any>();
  const [productRows, setProductRows] = useState<any>();
  const [guest, setGuest] = useState<any>();
  const [tax, setTax] = useState(0);
  const [openDeleteGuestModal, setOpenDeleteGuestModal] = useState(false);
  const [openAddGuestModal, setOpenAddGuestModal] = useState(false);

  const { data: orderDetailResponse } = useSWR(id && `orders/${id}`, id && fetcher);

  const { control, setValue, watch } = useForm({
    shouldUnregister: true,
    defaultValues: {
      discount: "",
    },
  });
  const { discount } = watch();

  const renderImage = image => (
    <div className="relative w-8 h-8 sm:w-12 sm:h-12 rounded-md overflow-hidden flex items-center justify-center text-center">
      {image ? (
        <Image src={image} alt={image} fill />
      ) : (
        <div className="text-xs bg-gray-200 w-full h-full flex items-center justify-center">&mdash;</div>
      )}
    </div>
  );

  const removeGuest = () => {
    setGuest(null);
    setOpenDeleteGuestModal(false);
  };

  const handleUpdateOrder = () => {
    const dataWithNewTax = orderData;
    const { _id, ...newOrder } = dataWithNewTax;

    put("/orders", {
      order: _id,
      newOrder: guest ? { ...newOrder, guest } : newOrder,
    })
      .then(res => {
        const { message } = res?.data;
        toast.success(message);
      })
      .then(() => router.push("/order-management"))
      .catch(({ errorMessage }) => toast.error(errorMessage));
  };

  const columns = [
    {
      field: "image",
      title: toLocales("fe_order_id_mid_order_summary_product"),
      className: "sm:min-w-[80px] text-left",
      render: renderImage,
    },
    {
      field: "name",
      title: toLocales("fe_order_id_mid_order_summary_name"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "categories",
      title: toLocales("fe_order_id_mid_order_summary_categories"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "price",
      title: toLocales("fe_order_id_mid_order_summary_price"),
      className: "sm:min-w-[120px] text-center",
    },
    {
      field: "quantity",
      title: toLocales("fe_order_id_mid_order_summary_quantity"),
      className: "sm:min-w-[150px] text-center",
    },
    {
      field: "totalAmount",
      title: toLocales("fe_order_id_mid_order_summary_total_amount"),
      className: "sm:min-w-[100px] text-center",
    },
  ];

  const convertProductToRow = async ({ name, image, categories, price }, quantity) =>
    await retrieveFileFromS3({ Bucket: process.env.NEXT_PUBLIC_BUCKET_NAME, Key: image })
      .then(imageFile => ({
        name,
        quantity,
        categories: categories?.join(", "),
        image: Uint8ArrayToBlob(imageFile?.Body) || null,
        price: `$ ${price?.toFixed(2)}`,
        totalAmount: `$ ${(price * quantity)?.toFixed(2)}`,
      }))
      .catch(() => ({
        name,
        quantity,
        image: null,
        categories: categories?.join(", "),
        price: `$ ${price?.toFixed(2)}`,
        totalAmount: `$ ${(price * quantity)?.toFixed(2)}`,
      }));

  const applyDiscount = async () => {
    await get(`/discounts`, `promoCode=${discount}`)
      .then(({ data }) => {
        const [responseDiscount] = data.data;

        if (!responseDiscount) {
          return toast.error("Discount not found");
        }

        if (responseDiscount.quantity) {
          let newTotal;
          const taxCash = (orderData?.tax * orderData?.subtotal) / 100;
          if (responseDiscount?.type?.toLowerCase()?.includes("percent")) {
            newTotal = (orderData?.subtotal + taxCash) * (1 - responseDiscount?.amount / 100);
          } else if (responseDiscount?.type?.toLowerCase()?.includes("fixed amount")) {
            newTotal = orderData?.subtotal + taxCash - responseDiscount?.amount;
          }

          setOrderData({ ...orderData, discount: responseDiscount, total: newTotal });
        } else {
          toast.error("Discount not available");
        }
      })
      .catch(err => toast.error(err));
  };

  const generateAppliedDiscount = data => {
    const { discount } = data;

    let result;
    if (discount?.type?.toLowerCase()?.includes("percent")) {
      result = `- $ ${((data?.subtotal * (1 + data?.tax / 100) * discount?.amount) / 100).toFixed(2)} (${
        discount?.amount || 0
      }%)`;
    } else if (discount?.type?.toLowerCase()?.includes("fixed amount")) {
      result = `- $ ${discount?.amount || 0}`;
    }

    return result;
  };

  useEffect(() => {
    get("/settings/64218e5ab16450577af837af", undefined)
      .then(({ data }) => {
        setTax(Number(data?.data?.value));
      })
      .catch(err => {});
  }, []);

  useEffect(() => {
    setLoading(!orderDetailResponse?.data);
    if (orderDetailResponse?.data) {
      const { products, ...rest } = orderDetailResponse?.data;

      let total = rest?.subtotal * (1 + tax / 100);

      if (rest?.discount?.promoCode) {
        setValue("discount", rest?.discount?.promoCode);
        if (rest?.discount?.type?.toLowerCase()?.includes("percent")) total *= 1 - rest?.discount?.amount / 100;
        else if (rest?.discount?.type?.toLowerCase()?.includes("fixed amount")) total -= rest?.discount?.amount;
      }

      setOrderData({ ...rest, tax, total });
      setGuest(rest?.owner || rest?.guest);

      const convertResponseToProductRows = async () => {
        const productRows = products?.map(({ product, quantity }) => convertProductToRow(product, quantity));
        return await Promise.all(productRows);
      };
      convertResponseToProductRows().then(result => setProductRows(result));
    }
  }, [orderDetailResponse, tax]);

  if (!orderData) return;

  return (
    <div>
      <div className="text-md sm:text-2xl">
        <div className="flex flex-col sm:flex-row gap-2 justify-between items-center">
          <div className="text-gray-600">
            <span className="font-bold">{toLocales("fe_order_id_top_title")} </span>#{orderData?._id}
          </div>
          <Button
            title={toLocales("fe_order_id_top_save")}
            onClick={handleUpdateOrder}
            className="text-white bg-sky-600 hover:bg-sky-700 rounded-md text-xs sm:text-sm tracking-wider font-semibold h-7 sm:h-9 w-16 sm:w-24"
          />
        </div>
      </div>
      <Card header={toLocales("fe_order_id_mid_overview")} className="my-6" hideCloseBtn>
        <div className="flex flex-col lg:flex-row justify-between gap-6 sm:gap-8 divide-y-2 lg:divide-y-0 lg:divide-x-2 text-gray-600">
          <div className="flex flex-col lg:flex-row gap-12">
            <div className="whitespace-nowrap text-ellipsis">
              <p className="text-sm sm:text-base font-semibold leading-7">
                {toLocales("fe_order_id_mid_overview_details")}
              </p>
              <div className="flex flex-col sm:flex-row gap-6 sm:gap-16 2xl:gap-32 mt-2 sm:pb-2 text-xs sm:text-sm">
                <div className="flex gap-8 text-xs sm:text-sm justify-between md:justify-start">
                  <div className="flex flex-col gap-2 leading-6">
                    <p>{toLocales("fe_order_id_mid_overview_details_created_at")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_created_by")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_payment_method")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_order_type")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_outlet_name")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_status")}</p>
                  </div>
                  <div className="flex flex-col gap-2 leading-6 text-right md:text-start">
                    <p>
                      {orderData?.orderTime ? (
                        format(
                          new Date(orderData?.orderTime),
                          `${DATE_FORMAT.DD_MMM_YYYY} | ${DATE_FORMAT["HH:mm:ss"]}`
                        )
                      ) : (
                        <>&mdash;</>
                      )}
                    </p>
                    <p>
                      {orderData?.createdUser ? (
                        `${orderData.createdUser?.firstName} ${orderData.createdUser?.lastName}`
                      ) : (
                        <>&mdash;</>
                      )}
                    </p>
                    <p>{orderData?.kindOfPayment || <>&mdash;</>}</p>
                    <p>{orderData?.type || <>&mdash;</>}</p>
                    <p>{orderData?.outletId?.name || <>&mdash;</>}</p>
                    <p>{orderData?.completed ? "Completed" : "In Progress"}</p>
                  </div>
                </div>
                <div className="flex gap-8 text-xs sm:text-sm justify-between md:justify-start">
                  <div className="flex flex-col gap-2 leading-6">
                    <p>{toLocales("fe_order_id_mid_overview_details_subtotal")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_service_charge")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_gst")}</p>
                    <p>{toLocales("fe_order_id_mid_overview_details_discount")}</p>
                    <p>
                      <Button
                        title={toLocales("fe_order_id_mid_overview_details")}
                        onClick={applyDiscount}
                        className="text-sky-500 hover:text-sky-600"
                      />
                    </p>
                    <p className="font-semibold">{toLocales("fe_order_id_mid_overview_details_total")}</p>
                  </div>
                  <div className="flex flex-col gap-2 text-gray-600 leading-6 text-right">
                    <p>$ {orderData?.subtotal?.toFixed(2) || <>&mdash;</>}</p>
                    <p>$ {orderData?.serviceCharge?.toFixed(2) || <>&mdash;</>}</p>
                    <p>
                      {orderData?.tax}% ($ {(orderData?.subtotal * orderData?.tax) / 100})
                    </p>
                    <UnderlineInput control={control} name="discount" type="text" className="[&_input]:text-right" />
                    <p>{generateAppliedDiscount(orderData) || <>&mdash;</>}</p>
                    <p className="font-semibold">$ {orderData?.total?.toFixed(2) || <>&mdash;</>}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-2/5 lg:pl-8 flex flex-col gap-2 pt-4 lg:pt-0 whitespace-nowrap text-ellipsis overflow-auto">
            <div className="flex justify-between">
              <p className="text-sm sm:text-base font-semibold text-gray-600">
                {orderData?.owner
                  ? toLocales("fe_order_id_mid_overview_member")
                  : toLocales("fe_order_id_mid_overview_guest")}
              </p>
              <Button
                title={
                  guest
                    ? toLocales("fe_order_id_mid_overview_guest_remove")
                    : toLocales("fe_order_id_mid_overview_guest_add")
                }
                onClick={guest ? () => setOpenDeleteGuestModal(true) : () => setOpenAddGuestModal(true)}
                className={`${
                  guest
                    ? "text-red-400 border-b-2 border-red-300 hover:text-red-500 hover:border-red-500"
                    : "text-sky-500 border-b-2 border-sky-500 hover:text-sky-600 hover:border-sky-600"
                } text-xs sm:text-sm tracking-wider w-fit`}
              />
            </div>
            <div className="flex gap-8 w-full text-xs sm:text-sm justify-between md:justify-start">
              <div className="flex flex-col gap-2 leading-6">
                <p>{toLocales("fe_order_id_mid_overview_guest_email")}</p>
                <p>{toLocales("fe_order_id_mid_overview_guest_full_name")}</p>
                <p>{toLocales("fe_order_id_mid_overview_guest_phone_number")}</p>
                <p>{toLocales("fe_order_id_mid_overview_guest_referral_code")}</p>
                <p>{toLocales("fe_order_id_mid_overview_guest_membership_id")}</p>
                <p>{toLocales("fe_order_id_mid_overview_guest_reward_points")}</p>
              </div>
              <div className="flex flex-col gap-2 leading-6 text-right md:text-start">
                <p>{guest?.email || <>&mdash;</>}</p>
                <p>{(guest?.firstName && `${guest?.firstName} ${guest?.lastName}`) || <>&mdash;</>}</p>
                <p>{guest?.phoneNumber || <>&mdash;</>}</p>
                <p>{guest?.referralCode || <>&mdash;</>}</p>
                <p>{guest?.membership?.membershipId || <>&mdash;</>}</p>
                <p>
                  {guest?.membership?.totalMemberPoints !== undefined ? (
                    guest?.membership?.totalMemberPoints
                  ) : (
                    <>&mdash;</>
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <Card header={toLocales("fe_order_id_mid_order_summary")} hideCloseBtn>
        <div className="overflow-auto w-full">
          <Table rows={productRows} columns={columns} className="text-xs sm:text-sm w-full" />
        </div>
      </Card>
      <DeleteGuestModal
        openModal={openDeleteGuestModal}
        setOpenModal={setOpenDeleteGuestModal}
        guest={guest}
        deleteGuest={removeGuest}
      />
      <AddGuestForm
        openModal={openAddGuestModal}
        setOpenModal={setOpenAddGuestModal}
        addGuest={data => {
          setGuest(data);
          setOpenAddGuestModal(false);
        }}
      />
    </div>
  );
};

OrderId.withSidebar = true;

// export const getStaticPaths = async () => {
//   return { paths: [{ params: { id: "" } }], fallback: true };
// };

// export const getStaticProps = async context => {
// const { token } = store.getState().userReducers.user || {};

//   const { id } = context.params;
//   // const data = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_V1}/orders/${id}`);
//   return {
//     props: { data: store.getState(), id },
//   };
// };

// export const getStaticProps = wrapper.getStaticProps(store => (): any => {
//   console.log(store.getState());
//   return { props: { token: null } };
// });

// export const getServerSideProps = async context => {
//   // const token = store.getState().userReducers.user;
//   const {req} = context
//   console.log(store.getState());
//   return {
//     props: {
//       token: null,
//     },
//   };
// };

export default withLoading(connect(mapStateToProps, null)(OrderId));
