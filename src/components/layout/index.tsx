/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { connect } from "react-redux";
import classnames from "classnames";
import { disconnectSocket, initSocket } from "../../services/socket";
import Sidebar from "./Sidebar";
import { userActions } from "../../../redux/actions";

const mapStateToProps = state => ({
  user: state.userReducers.user,
  socket: state.socketReducers,
});

const mapDispatchToProps = dispatch => ({
  logout: () => dispatch(userActions.logout()),
});

const Layout = ({ children, withSidebar, user, logout }) => {
  const router = useRouter();

  useEffect(() => {
    if (withSidebar) {
      if (user?.token) initSocket(user.token);

      return () => {
        if (user?.token) disconnectSocket();
      };
    }
  }, [user?.token]);

  useEffect(() => {
    if (!user && withSidebar) router.push("/login");
  }, [user]);

  return (
    <div>
      {withSidebar && <Sidebar user={user} logout={logout} />}
      <div className="grid mx-auto">
        <div
          className={classnames(
            "mt-12 sm:mt-0 px-4 sm:px-8 lg:px-12 overflow-hidden overflow-y-auto sm:h-screen",
            withSidebar && "sm:ml-16 py-10 sm:p-16",
            !withSidebar && "w-screen"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default connect(mapStateToProps, mapDispatchToProps)(Layout);
