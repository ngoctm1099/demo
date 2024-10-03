import Head from "next/head";
import { Provider } from "react-redux";
import Layout from "../src/components/layout";
import { persistor, store } from "../redux";
import { PersistGate } from "redux-persist/integration/react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/globals.css";

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Apron</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <main>
            <Layout withSidebar={Component.withSidebar}>
              <Component {...pageProps} />
              <ToastContainer
                autoClose={2000}
                closeButton={false}
                toastClassName="text-xs sm:text-sm"
                hideProgressBar={true}
              />
            </Layout>
          </main>
        </PersistGate>
      </Provider>
    </>
  );
}
