import React, { useEffect, useState } from "react";
import { FiEdit } from "react-icons/fi";
import Button from "../../../Button";
import Pagination from "../../../Pagination";
import Table from "../../../Table/Table";
import EditOutletForm from "./EditOutletForm";
import { toLocales } from "@gf/hermes";

const Outlet = ({ outletData, user, totalOutlet, currentOutletPage, setCurrentOutletPage }) => {
  const [outletRows, setOutletRows] = useState<any>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<any>();
  const [openModal, setOpenModal] = useState(false);
  const totalPage = Math.ceil(totalOutlet / 10);

  const renderActions = data => {
    const canEdit =
      user?.role?.role === "Restaurant Manager" || data.outletManagers.find(manager => manager?.email === user?.email);

    return canEdit ? (
      <div className="flex justify-center">
        <Button
          className="hover:bg-sky-100 text-sky-600 hover:text-blue-700 hover:border-blue-600 py-2  rounded-md h-8 w-8 sm:h-10 sm:w-10"
          onClick={() => {
            setSelectedOutlet(data);
            setOpenModal(true);
          }}
          title={<FiEdit size="1.5em" />}
        />
      </div>
    ) : (
      <div className="leading-6 py-2">&mdash;</div>
    );
  };

  const renderCollapse = data => {
    const productColumns = [
      {
        field: "title",
        title: "Title",
        className: "sm:min-w-[100px] text-left",
      },
      {
        field: "position",
        title: "Position",
        className: "sm:min-w-[150px] text-left",
      },
    ];

    return (
      <div className="rounded-b-lg p-4 mb-2 bg-slate-100">
        {data ? (
          <div className="p-4 bg-white rounded-md flex flex-col gap-3">
            <div>
              <p className="text-sm sm:text-base font-bold text-gray-600">Outlet Personnel</p>
              <div className="w-[50px] mt-1 h-1 bg-sky-500"></div>
            </div>
            <Table rows={data} columns={productColumns} />
          </div>
        ) : (
          <p>{toLocales("fe_common_no_data")}</p>
        )}
      </div>
    );
  };

  const columns = [
    {
      field: "name",
      title: toLocales("fe_settings_outlets_mid_table_name"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "outletManagers",
      title: toLocales("fe_settings_outlets_mid_table_rest_manager"),
      className: "sm:min-w-[150px] text-left",
    },
    {
      field: "operatingHours",
      title: toLocales("fe_settings_outlets_mid_table_operating_hours"),
      className: "sm:min-w-[120px] text-left",
    },
    {
      field: "actions",
      title: toLocales("fe_settings_outlets_mid_table_actions"),
      render: renderActions,
      className: "sm:min-w-[80px] text-center",
    },
  ];

  useEffect(() => {
    if (outletData) {
      setOutletRows(
        outletData?.map(({ _id, __v, ...outlet }) => ({
          name: outlet?.name,
          address: outlet?.address,
          outletManagers: outlet?.outletManagers?.map(mngr => `${mngr.firstName} ${mngr.lastName}`).join(", "),
          operatingHours: `${outlet?.startOperatingHours} - ${outlet?.endOperatingHours}`,
          renderCollapse: () => renderCollapse(outlet?.restaurantMngrs),
          actions: outlet,
        }))
      );
    }
  }, [outletData]);

  return (
    <div className="p-1 sm:px-5 sm:py-3 h-full overflow-auto">
      <p className="text-base sm:text-xl font-semibold text-gray-600 pb-3">
        {toLocales("fe_settings_outlets_top_title")}
      </p>
      <div className="p-1 sm:p-3 border border-gray-200 rounded sm:rounded-md">
        <div className="overflow-auto w-full">
          <Table rows={outletRows} columns={columns} className="w-full" collapsed />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between">
        <p className="font-semibold text-sm text-slate-600 sm:text-lg">
          {toLocales("fe_settings_outlets_bottom_total")} {totalOutlet}
        </p>
        {totalPage > 1 && (
          <div className="flex justify-self-center">
            <Pagination
              className="flex gap-1 sm:gap-3"
              totalPage={totalPage}
              currentPage={currentOutletPage}
              rangePageIndex={3}
              setCurrentPage={setCurrentOutletPage}
            />
          </div>
        )}
      </div>
      {openModal && (
        <EditOutletForm openModal={openModal} setOpenModal={setOpenModal} selectedOutlet={selectedOutlet} />
      )}
    </div>
  );
};

export default Outlet;
