import { applyMiddleware, legacy_createStore as createStore } from "redux";
import { persistReducer, persistStore } from "redux-persist";
// import { createWrapper } from "next-redux-wrapper";
import storage from "redux-persist/lib/storage";
import thunkMiddleware from "redux-thunk";

import reducers from "./reducers";

const persistConfig = {
  key: "root",
  storage,
};

const persistedReducer = persistReducer(persistConfig, reducers);
const makeStore = () => createStore(persistedReducer, applyMiddleware(thunkMiddleware));
const store = makeStore();
const persistor = persistStore(store);

// const wrapper = createWrapper(makeStore);

export { store, persistor };
