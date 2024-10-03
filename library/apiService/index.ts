/* eslint-disable import/no-anonymous-default-export */
import axios from "axios";

import instance from "../apiServiceInstance";

const { CancelToken } = axios || {};
const cancel = {};

/**
 * @param {string} path
 * @param {object} [param]
 * @param {object} [headers]
 * @param {string} [baseURL]
 * @description Method to call POST through Axios
 */
export const post = (path, param, headers?, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }
  if (cancel[path]) {
    cancel[path]();
    cancel[path] = undefined;
  }
  return instance.post(path, param, {
    ...headers,
    cancelToken: new CancelToken(c => {
      cancel[path] = c;
    }),
  });
};

/**
 * @param {string} path
 * @param {object} [param]
 * @param {object} [headers]
 * @param {string} [baseURL]
 * @description Method to call PUT through Axios
 */
export const put = (path, param, headers?, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }
  if (cancel[path]) {
    cancel[path]();
    cancel[path] = undefined;
  }
  return instance.put(path, param, {
    ...headers,
    cancelToken: new CancelToken(c => {
      cancel[path] = c;
    }),
  });
};

/**
 * @param {string} path
 * @param {object} [param]
 * @param {object} [headers]
 * @param {string} [baseURL]
 * @description Method to call PUT through Axios
 */
export const patch = (path, param, headers?, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }
  if (cancel[path]) {
    cancel[path]();
    cancel[path] = undefined;
  }
  return instance.patch(path, param, {
    ...headers,
    cancelToken: new CancelToken(c => {
      cancel[path] = c;
    }),
  });
};

/**
 * @param {string} path
 * @param {string} [param]
 * @param {object} [headers]
 * @param {string} [baseURL]
 * @description Method to call GET through Axios
 */
export const get = (path, param, headers?, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }
  if (cancel[path]) {
    cancel[path]();
    cancel[path] = undefined;
  }
  return instance.get(`${path}?${param === undefined ? "" : param}`, {
    ...headers,
    cancelToken: new CancelToken(c => {
      cancel[path] = c;
    }),
  });
};

/**
 * @param {string} path
 * @param {string} data
 * @param {object|undefined} headers
 * @param {string|undefined} baseURL
 * @description Method to call ApiDelete through Axios
 */
export const apiDelete = (path, data, headers?, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }

  return instance.delete(path, { data });
};

/**
 * @param {string} requests
 * @description Method to call a series of axios call through Axios
 */
// export const all = (requests) => instance.all(requests);

export const fetcher = (url, baseURL = process.env.NEXT_PUBLIC_BASE_URL_V1) => {
  if (baseURL) {
    instance.defaults.baseURL = baseURL;
  }
  return instance.get(url).then(res => res.data);
};

export default {
  post,
  put,
  patch,
  get,
  // apiDelete,
  // all,
  fetcher,
};
