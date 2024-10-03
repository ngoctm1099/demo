/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { fetcher } from "../../library/apiService";
import useSWR from "swr";

const useSettings = () => {
  const [settings, setSettings] = useState([]);
  const { data: dataResponse, mutate: mutateRoles } = useSWR("/settings", fetcher);

  useEffect(() => {
    const { data } = dataResponse || {};
    if (data) setSettings(data);
  }, [dataResponse]);

  return { settings, setSettings, mutateRoles };
};

export default useSettings;
