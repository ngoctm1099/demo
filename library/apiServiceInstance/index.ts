import axios, { RawAxiosRequestHeaders } from "axios";

import { USER_LOGOUT, UPDATE_USER_ACCESS_TOKEN } from "../../redux/actions/actionTypes";
import { store } from "../../redux";

const { CancelToken } = axios;
let cancel, originalRequest;

const instance = axios.create({
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
    // Cookies: window. include cookies
  },
});

instance.interceptors.request.use(
  config => {
    const tempConfig = { ...config };
    const _state = store.getState();
    const { user } = _state.userReducers || {};
    const { token } = user || {};

    if (!(tempConfig.headers as RawAxiosRequestHeaders).Authorization && token) {
      (tempConfig.headers as RawAxiosRequestHeaders).Authorization = `Bearer ${token}`;
    }
    tempConfig.headers["Content-Type"] = "application/json";

    return tempConfig;
  },
  error => {
    Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => response,
  error => {
    originalRequest = error.config;
    if (originalRequest) {
      if (error.response) {
        const { data, status } = error.response || {};
        const { errorMessage, message } = data || {};

        if (status === 400 && (errorMessage || message)) {
          return Promise.reject(error);
        }

        if (status === 401) {
          const state = store.getState();
          if (errorMessage === "Jwt expired") {
            if (state.userReducers.user) {
              const { refreshToken } = state.userReducers.user;

              originalRequest._retry = true;
              if (cancel) cancel();

              return instance
                .post(
                  "/refreshToken",
                  {
                    refreshKey: process.env.NEXT_PUBLIC_REFRESH_KEY,
                    refreshToken,
                  },
                  {
                    cancelToken: new CancelToken(c => {
                      cancel = c;
                    }),
                  }
                )
                .then(res => {
                  const { data, message } = res.data || {};
                  if (message === "Refresh token success") {
                    store.dispatch({
                      type: UPDATE_USER_ACCESS_TOKEN,
                      value: {
                        token: data.token,
                        refreshToken: data.refreshToken,
                      },
                    });
                    return data;
                  }
                })
                .then(data => {
                  instance({
                    ...originalRequest,
                    headers: { ...originalRequest.headers, Authorization: `Bearer ${data?.token}` },
                  });
                });
            } else return;
          } else if (errorMessage === "Unauthorized" || errorMessage === "Failed to decode token") {
            return store.dispatch({ type: USER_LOGOUT });
          }
          return Promise.reject(error);
        } else if (status === 500) {
          return Promise.reject(error);
        }
      }
    }
    // return Promise.reject(error);
  }
);

export default instance;
