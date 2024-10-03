import React, { useCallback, useState } from "react";

export const withLoading = Component => {
  const Loading = () => {
    return (
      <div className="flex items-center justify-center w-full">
        <div className="fixed inset-0 z-20 bg-gray-700 bg-opacity-75 transition-opacity"></div>
        <div className="fixed inset-0 z-20 flex justify-center items-center space-x-1 text-white h-screen">
          <svg fill="none" className="w-24 h-24 animate-spin" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
            <path
              clipRule="evenodd"
              d="M15.165 8.53a.5.5 0 01-.404.58A7 7 0 1023 16a.5.5 0 011 0 8 8 0 11-9.416-7.874.5.5 0 01.58.404z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  };

  const HOC = props => {
    const [isLoading, setIsLoading] = useState(false);
    const setLoadingState = useCallback(loading => {
      setIsLoading(loading);
    }, []);

    return (
      <>
        {isLoading && <Loading />}
        <Component {...props} setLoading={setLoadingState} />
      </>
    );
  };
  HOC.withSidebar = Component.withSidebar;

  return HOC;
};
