/* eslint-disable import/no-anonymous-default-export */
import { apiService } from "../../../library";

import { SET_USER, USER_LOGOUT } from "../actionTypes";

const setUser = payload => ({
  type: SET_USER,
  value: payload,
});

const logoutUser = () => ({ type: USER_LOGOUT });

const updateUser = payload => dispatch => dispatch(setUser(payload));

const login =
  ({ email, password, successCallback, errorCallback }) =>
  dispatch => {
    apiService
      .post("/signIn", { email, password })
      .then(res => {
        const { data, message } = res.data || {};
        if (message === "Sign in success") {
          if (successCallback) successCallback(res.data);

          return dispatch(
            setUser({
              refreshToken: data.refreshToken,
              token: data.token,
              ...data.user,
            })
          );
        }
      })
      .catch(err => {
        if (errorCallback) errorCallback(err);
      });
  };

const logout = () => dispatch => dispatch(logoutUser());

export default { login, logout, updateUser };
