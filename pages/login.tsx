/* eslint-disable react-hooks/exhaustive-deps */
import { useRouter } from "next/router";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { connect } from "react-redux";
import { toast } from "react-toastify";
import loginSchema from "../src/components/features/Login/loginSchema";
import { userActions } from "../redux/actions";
import Form from "../src/components/Form";
import { useEffect } from "react";
import Image from "next/image";
import { toLocales } from "../src/utils/string";

const mapStateToProps = state => ({
  user: state.userReducers.user,
});

const mapDispatchToProps = dispatch => ({
  login: ({ email, password, successCallback, errorCallback }) =>
    dispatch(userActions.login({ email, password, successCallback, errorCallback })),
});

const Login = ({ user, login }) => {
  const router = useRouter();

  const methods = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    shouldUnregister: true,
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const { handleSubmit } = methods;

  const inputs = [
    {
      type: "email",
      label: toLocales("fe_login_email"),
      name: "email",
      placeholder: toLocales("fe_login_enter_your_email"),
      className: "mb-3 sm:mb-4 text-xs sm:text-sm",
    },
    {
      type: "password",
      label: toLocales("fe_login_password"),
      name: "password",
      placeholder: toLocales("fe_login_enter_your_password"),
      className: "sm:mb-6 text-xs sm:text-sm",
    },
  ];
  const doLogin = data => {
    const { email, password } = data || {};

    if (email && password)
      login({
        email,
        password,
        successCallback: ({ message }) => {
          toast.success(message);
          router.push("/user-management");
        },
        errorCallback: error => toast.error(error.response?.data?.errorMessage || "Login failed!"),
      });
  };

  const btns = [
    {
      title: toLocales("fe_login_title"),
      onClick: handleSubmit(doLogin),
      className:
        "text-white w-full bg-sky-600 hover:bg-sky-700 focus:ring-4 focus:ring-blue-300 uppercase font-bold rounded-md text-xs sm:text-sm px-5 py-2.5 mr-2 mb-2",
    },
  ];

  useEffect(() => {
    if (!user) router.push("/user-management");
  }, [user]);

  return (
    <div className="mx-auto mt-24 sm:mt-56 w-56 sm:w-72">
      <div className="grid justify-center pb-4 sm:pb-5">
        <Image src="/apron_logo.svg" alt="apron-logo" width={120} height={120} priority />
      </div>
      <Form inputs={inputs} btns={btns} methods={methods} />
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
