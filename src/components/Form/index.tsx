import React from "react";
import { FormProvider } from "react-hook-form";
import Button from "../Button";
import DatePicker from "../DatePicker";
import DateRangePicker from "../DatePicker/DateRangePicker";
import Input from "../Input";
import DropdownInput from "../Input/DropdownInput";
import RadioInput from "../Input/RadioInput";
import Select from "../Select";
import SelectSearch from "../Select/SelectSearch";
import Toggle from "../Toggle";

interface FormProps {
  inputs: any;
  btns: any;
  methods: any;
  className?: string;
}

const Form = ({ inputs, btns, methods, className }: FormProps) => {
  const { control } = methods;

  const renderInputList = (inputs: any[]) =>
    inputs.map((input, index) => {
      switch (input.type) {
        case "select":
          return <Select key={`${input.name}-${index}`} control={control} {...input} />;
        case "toggle":
          return <Toggle key={`${input.name}-${index}`} control={control} {...input} />;
        case "dateRange":
          return <DateRangePicker key={`${input.name}-${index}`} control={control} {...input} />;
        case "date":
          return <DatePicker key={`${input.name}-${index}`} control={control} {...input} />;
        case "search":
          return <SelectSearch key={`${input.name}-${index}`} control={control} {...input} />;
        case "radio":
          return <RadioInput key={`${input.name}-${index}`} control={control} {...input} />;
        case "dropdownInput":
          return <DropdownInput key={`${input.name}-${index}`} control={control} {...input} />;
        default:
          return <Input key={`${input.name}-${index}`} control={control} {...input} />;
      }
    });

  const renderSubmitBtn = (btns: any[]) => btns.map((btn, index) => <Button key={`${btn.title}-${index}`} {...btn} />);

  return (
    <FormProvider {...methods}>
      <form className={className}>
        {renderInputList(inputs)}
        <br />
        {renderSubmitBtn(btns)}
      </form>
    </FormProvider>
  );
};

export default Form;
