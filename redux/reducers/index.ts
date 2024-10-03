import { combineReducers } from "redux";

import userReducers from "./userReducers";

const appReducer = combineReducers({ userReducers });

const rootReducer = (state, action) => {
  if (action.type === "USER_LOGOUT" || action.type === "GUEST_LOGOUT") {
    state = undefined;
  }

  return appReducer(state, action);
};

export default rootReducer;
