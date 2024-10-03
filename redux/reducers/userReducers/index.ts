import { SET_USER, UPDATE_USER_ACCESS_TOKEN } from "../../actions/actionTypes";

const initialState = {
  user: null,
};

const userReducers = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER:
      return { ...state, user: action.value };

    case UPDATE_USER_ACCESS_TOKEN:
      return { ...state, user: { ...state.user, ...action.value } };

    default:
      return state;
  }
};

export default userReducers;
