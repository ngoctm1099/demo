/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import classnames from "classnames";
import useSWR from "swr";
import Outlet from "../src/components/features/Settings/Outlet";
import { connect } from "react-redux";
import { fetcher } from "../library/apiService";
import { getSocket } from "../src/services/socket";
import { AiOutlineAppstoreAdd, AiOutlineIdcard, AiOutlineSetting } from "react-icons/ai";
import { LiaImageSolid } from "react-icons/lia";
import Membership from "../src/components/features/Settings/Membership";
import GeneralSettings from "../src/components/features/Settings/GeneralSettings";
import Banner from "../src/components/features/Settings/Banner";
import { toLocales } from "@gf/hermes";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const Settings = ({ user }) => {
  const navbarItems = [
    {
      icon: <AiOutlineSetting className="w-4 h-4 sm:w-5 sm:h-5" />,
      name: "settings",
      label: toLocales("fe_settings_navbar_settings"),
    },
    {
      icon: <AiOutlineIdcard className="w-4 h-4 sm:w-5 sm:h-5" />,
      name: "membership",
      label: toLocales("fe_settings_navbar_membership"),
    },
    {
      icon: <AiOutlineAppstoreAdd className="w-4 h-4 sm:w-5 sm:h-5" />,
      name: "outlets",
      label: toLocales("fe_settings_navbar_outlets"),
    },
    {
      icon: <LiaImageSolid className="w-4 h-4 sm:w-5 sm:h-5" />,
      name: "banner",
      label: toLocales("fe_settings_navbar_banner"),
    },
  ];
  const [settings, setSettings] = useState<any>();
  const [outlets, setOutlets] = useState<any>();
  const [memberships, setMemberships] = useState<any>();
  const [bannerLimit, setBannerLimit] = useState(0);
  const [currentTab, setCurrentTab] = useState("settings");
  const [dataSocket, setDataSocket] = useState<any>();
  const [currentOutletPage, setCurrentOutletPage] = useState(1);
  const [totalOutlet, setTotalOutlet] = useState(0);
  const socket = getSocket();

  const { data: servicesData } = useSWR("/settings", fetcher, {
    onSuccess: data => {
      setSettings(
        data?.data?.filter(({ _id }) => _id !== "646a3972ad10bd9aedef4406" && _id !== "644e293734e0b8fbe177d681")
      );
      setMemberships(
        data?.data?.filter(({ _id }) => _id === "646a3972ad10bd9aedef4406" || _id === "644e293734e0b8fbe177d681")
      );
      setBannerLimit(data?.data?.filter(({ _id }) => _id === "64f6ea1a6fe98ad5051518fd")[0]);
    },
  });
  const { data: outletData } = useSWR(`/outlets?row=10&page=${currentOutletPage}`, fetcher, {
    onSuccess: data => {
      setOutlets(data?.data);
      setTotalOutlet(data?.metadata?.total);
    },
  });

  const renderNavBar = items =>
    items.map((item, index) => (
      <div
        key={index}
        onClick={() => setCurrentTab(item.name)}
        className={classnames(
          "text-xs sm:text-sm py-3 px-3 text-gray-500 cursor-pointer",
          "flex items-center gap-2 transition-all duration-300 rounded lg:rounded-none",
          currentTab === item.name ? "lg:border-l-2 sm:border-gray-400 bg-gray-100 !text-gray-800" : "hover:bg-gray-50"
        )}
      >
        {item.icon}
        {item.label}
      </div>
    ));

  const renderContent = tab => {
    switch (tab) {
      case "outlets":
        return (
          <Outlet
            outletData={outlets}
            user={user}
            totalOutlet={totalOutlet}
            currentOutletPage={currentOutletPage}
            setCurrentOutletPage={setCurrentOutletPage}
          />
        );
      case "membership":
        return <Membership memberships={memberships} />;
      case "banner":
        return <Banner bannerLimit={bannerLimit} />;
      case "settings":
      default:
        return <GeneralSettings settings={settings} />;
    }
  };

  const handleSettingEvents = dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        return setSettings([...settings, data]);
      case "UPDATE":
        if (data?._id === "646a3972ad10bd9aedef4406" || data?._id === "644e293734e0b8fbe177d681")
          return setMemberships(memberships?.map(mbs => (mbs?._id === data?._id ? data : mbs)));

        const updatedSettings = settings.map(setting => (setting?._id === data?._id ? data : setting));
        return setSettings(updatedSettings);
      case "DELETE":
        if (data?._id === "646a3972ad10bd9aedef4406" || data?._id === "644e293734e0b8fbe177d681")
          return setMemberships(memberships?.filter(mbs => mbs?._id === data?._id));

        const newSettings = settings.filter(setting => setting?._id !== data?._id);
        return setSettings(newSettings);
      default:
        break;
    }
  };

  const handleOutletEvents = dataSocket => {
    const { message, data } = dataSocket || {};

    switch (message) {
      case "CREATE":
        const newData = [data, ...outlets];
        if (newData.length > 10) {
          newData.pop();
        }
        return setOutlets([data, ...outlets]);
      case "UPDATE":
        const updatedOutlets = outlets.map(outlet => (outlet?._id === data?._id ? data : outlet));
        return setOutlets(updatedOutlets);
      case "DELETE":
        const newOutlets = outlets.filter(outlet => outlet?._id !== data?._id);
        setTotalOutlet(totalOutlet - 1);
        return setOutlets(newOutlets);
      default:
        break;
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("settings", data => setDataSocket({ ...data, event: "settings" }));
      socket.on("outlets", data => setDataSocket({ ...data, event: "outlets" }));
    }

    return () => {
      if (socket) {
        socket.off("settings");
        socket.off("outlets");
      }
    };
  }, [socket]);

  useEffect(() => {
    if (dataSocket) {
      const { event, ...restData } = dataSocket;
      switch (event) {
        case "settings":
          return handleSettingEvents(restData);
        case "outlets":
          return handleOutletEvents(restData);
        default:
          break;
      }
    }
  }, [dataSocket]);

  return (
    <div className="mx-auto">
      <p className="text-md sm:text-2xl font-semibold text-gray-600 mb-6">{toLocales("fe_settings_top_title")}</p>
      <div className="border border-slate-200 rounded-lg flex flex-col lg:flex-row lg:justify-between sm:h-[80vh] sm:overflow-hidden">
        <div className="p-2 lg:p-0">
          <div className="flex-[1] flex flex-row lg:flex-col h-full !sm:min-w-[200px] w-full overflow-auto">
            {renderNavBar(navbarItems)}
          </div>
        </div>
        <div className="flex-[5] overflow-auto lg:border-l border-slate-200 p-2 text-gray-800 text-xs sm:text-sm">
          {renderContent(currentTab)}
        </div>
      </div>
    </div>
  );
};
Settings.withSidebar = true;

export default connect(mapStateToProps, null)(Settings);
