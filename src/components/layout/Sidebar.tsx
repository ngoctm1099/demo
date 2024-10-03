import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AiOutlinePieChart,
  AiOutlineTags,
  AiOutlineTeam,
  AiOutlineSetting,
  AiOutlineShoppingCart,
  AiOutlineSafetyCertificate,
  AiOutlineRest,
  AiOutlineUser,
  AiOutlineLogout,
} from "react-icons/ai";
import { HiOutlineUserCircle } from "react-icons/hi";
import { BsArrowRightSquare } from "react-icons/bs";
import { useRouter } from "next/router";
import classnames from "classnames";
import { convertKeyToImage } from "../../utils/s3File";
import Modal from "../Modal";
import Button from "../Button";
import { toast } from "react-toastify";
import { withLoading } from "../Loading/withLoading";
import { motion } from "framer-motion";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import { IoMdClose } from "react-icons/io";
import { toLocales } from "@gf/hermes";

const menuIconBtns = [
  {
    icon: <AiOutlinePieChart size="2em" />,
    label: toLocales("fe_sidebar_dashboard"),
    name: "dashboard",
    href: "/dashboard",
  },
  {
    icon: <AiOutlineUser size="2em" />,
    label: toLocales("fe_sidebar_user"),
    name: "user",

    href: "/user-management",
  },
  {
    icon: <AiOutlineSafetyCertificate size="2em" />,
    label: toLocales("fe_sidebar_role"),
    name: "role",
    href: "/role-management",
  },
  {
    icon: <AiOutlineRest size="2em" />,
    label: toLocales("fe_sidebar_product"),
    name: "product",
    href: "/product-management",
  },
  {
    icon: <AiOutlineShoppingCart size="2em" />,
    label: toLocales("fe_sidebar_order"),
    name: "order",
    href: "/order-management",
  },
  {
    icon: <AiOutlineTags size="2em" />,
    label: toLocales("fe_sidebar_discount"),
    name: "order",
    href: "/discount-management",
  },
  {
    icon: <HiOutlineUserCircle size="2em" />,
    label: toLocales("fe_sidebar_customer"),
    name: "order",
    href: "/customer-management",
  },
  {
    icon: <AiOutlineTeam size="2em" />,
    label: toLocales("fe_sidebar_membership"),
    name: "membership",
    href: "/membership-management",
  },
  {
    icon: <AiOutlineSetting size="2em" />,
    label: toLocales("fe_sidebar_settings"),
    name: "settings",
    href: "/settings",
  },
];

const Sidebar = ({ user, logout, setLoading }) => {
  const router = useRouter();
  const avatarRef = useRef<HTMLDivElement>();
  const barRef = useRef<HTMLDivElement>();
  const [isExpanded, setIsExpanded] = useState(false);
  const [avatar, setAvatar] = useState<any>();
  const [openMenu, setOpenMenu] = useState(false);
  const [openLogoutModal, setOpenLogoutModal] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [selectedTabIndex, setSelectedTabIndex] = useState(
    menuIconBtns.findIndex(btn => router.pathname?.includes(btn.href)) || 0
  );
  const variants = {
    closed: {
      opacity: 0,
      scale: 0,
      x: window.innerWidth >= 640 ? "-25%" : "50%",
      y: window.innerWidth >= 640 ? "50%" : "-50%",
      transition: { duration: 0.1 },
    },
    open: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const menuVariants = {
    closed: {
      opacity: 1,
      scale: 1,
      x: "-100%",
      y: 0,
      transition: { duration: 0.1 },
    },
    open: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const profileBtns = [
    {
      icon: <AiOutlineUser size="1.5em" />,
      label: toLocales("fe_sidebar_profile"),
      name: "profile",
      href: "/profile",
      onClick: () => {
        setOpenProfile(false);
        setSelectedTabIndex(undefined);
        router.push("/profile");
      },
    },
    {
      icon: <AiOutlineLogout size="1.5em" />,
      label: toLocales("fe_sidebar_logout"),
      name: "logout",
      onClick: () => {
        setOpenProfile(false);
        setSelectedTabIndex(undefined);
        setOpenLogoutModal(true);
      },
    },
  ];

  const onExpand = () => setIsExpanded(!isExpanded);
  const onClickAvatar = () => setOpenProfile(!openProfile);

  const renderExpandButton = () => (
    <div
      className="cursor-pointer hidden sm:inline-block p-2 sm:p-3 rounded-lg text-xs hover:bg-sky-50 hover:text-sky-600"
      onClick={onExpand}
    >
      <BsArrowRightSquare
        size="1.8em"
        className={classnames(isExpanded && "rotate-180", "transition-all duration-200")}
      />
    </div>
  );

  const renderProfileOptions = options =>
    options.map((option, index) => (
      <div
        key={`${option.name}-${index}`}
        onClick={option.onClick}
        className={classnames(
          "flex items-center gap-2 p-2 transition-colors duration-400 rounded cursor-pointer text-xs",
          index === 0 ? "hover:bg-sky-100 hover:text-sky-600" : "hover:bg-red-100 hover:text-red-600",
          router.pathname === option?.href && "bg-sky-50 text-sky-600"
        )}
      >
        <span>{option.icon}</span>
        <span>{option.label}</span>
      </div>
    ));

  const doLogout = () => {
    setLoading(true);
    logout();
    toast.success("Logged out!");
  };

  const onClickNavbar = (href, index) => {
    router.push(href);
    setSelectedTabIndex(index);
    if (isExpanded) setIsExpanded(false);
    if (openMenu) setOpenMenu(false);
  };

  const renderMenuBtns = (btns, withLabel?: boolean) =>
    btns.map((btn, index) => (
      <div
        className={classnames(
          "cursor-pointer px-5 py-4 sm:p-3 justify-start w-full text-xs transition-colors duration-200",
          "flex items-center gap-3 sm:w-full sm:rounded-lg",
          !isExpanded && "sm:justify-center",
          btns[selectedTabIndex]?.label === btn.label
            ? "bg-sky-100 hover:bg-sky-100 text-sky-600 hover:border-sky-500"
            : "hover:bg-sky-50 hover:text-sky-600"
        )}
        key={`${btn.name}-${index}`}
        onClick={() => onClickNavbar(btn.href, index)}
      >
        {btn.icon}
        {(isExpanded || withLabel) && <span>{btn.label}</span>}
      </div>
    ));

  useEffect(() => {
    convertKeyToImage(user?.avatar)
      .then(res => setAvatar(res))
      .catch(err => {});
  }, [user?.avatar]);

  useBackgroundClick(avatarRef, openProfile, setOpenProfile);
  useBackgroundClick(barRef, isExpanded, setIsExpanded);

  return (
    <div>
      <div
        ref={barRef}
        className={classnames(
          "flex justify-center absolute transition-all duration-200 p-1 sm:px-3 sm:py-2 bg-white",
          "w-screen sm:h-screen shadow-md sm:shadow-xl z-10",
          isExpanded ? "sm:w-36" : "sm:w-16"
        )}
      >
        <div className="flex sm:flex-col items-center w-full sm:w-auto justify-between text-gray-500">
          <div className="flex sm:flex-col w-full overflow-hidden items-center">
            <div className="flex sm:flex-col ml-1 sm:ml-0 items-center">
              <Image
                src="/apron_logo.svg"
                className="sm:mb-4 w-10 h-10 sm:w-12 sm:h-12"
                alt="apron-logo"
                onClick={() => setOpenMenu(!openMenu)}
                width={50}
                height={50}
                priority
              />
              {renderExpandButton()}
            </div>
            <div
              className={classnames(
                "hidden sm:flex sm:flex-col items-center gap-2 sm:mt-8 lg:mt-20 max-w-[200px]",
                isExpanded ? "justify-start" : "justify-center"
              )}
            >
              {renderMenuBtns(menuIconBtns)}
            </div>
          </div>
          <div
            className={classnames(
              "flex w-8 h-8 sm:w-12 sm:h-12 mr-2 sm:mr-0 justify-center items-center text-center my-2 rounded-full cursor-pointer",
              !avatar && "border border-gray-300"
            )}
            onClick={onClickAvatar}
          >
            {avatar ? (
              <div className="rounded-full overflow-hidden flex justify-center items-center drop-shadow-lg">
                <Image
                  src={avatar}
                  className="block"
                  alt="preview-product"
                  width="112"
                  height="112"
                  style={{ objectFit: "fill" }}
                />
              </div>
            ) : (
              <span className="text-gray-400 px-6">
                <AiOutlineUser size="1.5em" />
              </span>
            )}
            <Modal
              header="Do you want to logout?"
              open={openLogoutModal}
              setOpen={setOpenLogoutModal}
              className="!max-w-sm"
              body={
                <div className="w-full flex justify-evenly gap-4">
                  <Button
                    title="Cancel"
                    className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                    onClick={() => setOpenLogoutModal(false)}
                  />
                  <Button
                    title="Logout"
                    className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
                    onClick={doLogout}
                  />
                </div>
              }
            />
            <motion.div
              animate={openProfile ? "open" : "closed"}
              variants={variants}
              ref={avatarRef}
              className={classnames(
                "z-5 text-sm absolute top-16 right-3 sm:top-auto sm:right-auto sm:bottom-4 p-2 drop-shadow-lg bg-white rounded-md",
                isExpanded ? "sm:left-32" : "sm:left-20"
              )}
            >
              <div className="z-10 inset-0 bg-opacity-10 transition-opacity"></div>
              <div className="z-20 w-full flex flex-col gap-1">{renderProfileOptions(profileBtns)}</div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="block sm:hidden absolute h-0 items-left">
        {openMenu && <div className="fixed inset-0 z-5 bg-gray-700 bg-opacity-10 transition-opacity"></div>}
        <motion.div
          animate={openMenu ? "open" : "closed"}
          className="m-0 z-20 sm:hidden flex flex-col w-screen text-gray-500 relative h-screen bg-white"
          variants={menuVariants}
        >
          <div className="py-12 flex justify-end w-full pr-4">
            <span onClick={() => setOpenMenu(false)}>
              <IoMdClose size="1.5em" />
            </span>
          </div>
          {renderMenuBtns(menuIconBtns, true)}
        </motion.div>
      </div>
    </div>
  );
};

export default withLoading(Sidebar);
