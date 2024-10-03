/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { fetcher } from "../../library/apiService";
import useSWR from "swr";
import { useDelaySearch } from "./useDelaySearch";

const useRoles = (searchInput?) => {
  const [roles, setRoles] = useState([]);
  const { search } = useDelaySearch(searchInput);

  const { data: dataResponse, mutate: mutateRoles } = useSWR(`/roles${search ? `&search=${search}` : ""}`, fetcher);

  useEffect(() => {
    const { data } = dataResponse || {};
    if (data) setRoles(data);
  }, [dataResponse]);

  return { roles, setRoles, mutateRoles };
};

export default useRoles;
