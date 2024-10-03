import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AiFillHeart, AiFillStar } from "react-icons/ai";
import { RiMedalFill } from "react-icons/ri";
import SelectDropdown from "../src/components/SelectDropdown";
import Stepbar from "../src/components/Stepbar";
import Table from "../src/components/Table/Table";

const Dashboard = () => {
  const methods = useForm();
  const options = [
    { label: "JavaScript", expand: false, subitems: [{ label: "React" }, { label: "Vue" }, { label: "Angular" }] },
    {
      label: "HTML",
      expand: false,
      subitems: [{ label: "HTML5" }, { label: "XML" }],
    },
  ];

  const renderCollapse = data => {
    return (
      <div className="bg-slate-100 w-full p-4">
        <div>name: {data.name}</div>
        <div>title: {data.title}</div>
        <div>address: {data.address}</div>
      </div>
    );
  };

  const columns = [
    { field: "name", title: "Name", className: "min-w-[110px] text-left" },
    { field: "email", title: "Email", className: "min-w-[140px] text-left" },
    { field: "address", title: "Address", className: "min-w-[120px] text-left" },
  ];

  const rows = [
    {
      name: "Ngoc",
      email: "ngoc@gmail.com",
      address: "Hanoi, VN",
      renderCollapse: () => renderCollapse({ name: "Ngoc", email: "ngoc@gmail.com", address: "Hanoi, VN" }),
    },
    {
      name: "Viet Anh",
      email: "anh@gmail.com",
      address: "Hanoi, VN",
      renderCollapse: () => renderCollapse({ name: "Ngoc", email: "ngoc@gmail.com", address: "Hanoi, VN" }),
    },
  ];

  return (
    <div>
      <p className="text-md sm:text-2xl  font-semibold text-gray-600 mb-6">Dashboard</p>
      {/* <div className="my-10">{renderSelect()}</div> */}
      <FormProvider {...methods}>
        <div className="w-96">
          <SelectDropdown options={options} name="select" label="Test" placeholder="Select" />
        </div>
        <div className="text-sm border rounded-md p-2 my-12 max-w-fit">
          <Table rows={rows} columns={columns} collapsed />
        </div>
      </FormProvider>
      <div className="w-1/3">
        <Stepbar
          tiers={[
            { title: "Green", points: 0, color: "bg-green-500", icon: <AiFillHeart color="white" /> },
            { title: "Silver", points: 100, color: "bg-gray-500", icon: <AiFillStar color="white" /> },
            { title: "Gold", points: 200, color: "bg-yellow-400", icon: <RiMedalFill color="white" /> },
          ]}
          currentTier={{ title: "Green", points: 150 }}
        />
      </div>
    </div>
  );
};

Dashboard.withSidebar = true;

export default Dashboard;
