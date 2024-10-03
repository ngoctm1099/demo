import { useEffect } from "react";

const useBlockScroll = open => {
  useEffect(() => {
    if (open) {
      document.body.style.position = "fixed";
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.position = "";
      document.body.style.overflow = "";
    }
  }, [open]);
};

export default useBlockScroll;
