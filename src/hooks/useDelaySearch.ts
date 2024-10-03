import { useEffect, useState } from "react";
import { debounce } from "../utils";

export const useDelaySearch = (searchInput, timeout?) => {
  const [search, setSearch] = useState("");

  useEffect(() => debounce(() => setSearch(searchInput), timeout || 1500), [searchInput, timeout]);

  return { search, setSearch };
};
