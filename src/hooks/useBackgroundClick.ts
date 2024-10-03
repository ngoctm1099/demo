/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";

const useBackgroundClick = (modalRef, openModal, setOpenModal, disabledBackgroundClick?) => {
  useEffect(() => {
    if (!disabledBackgroundClick) {
      const checkIfClickedOutside = e => {
        if (openModal && modalRef.current && !modalRef.current.contains(e.target)) {
          setOpenModal(false);
        }
      };
      document.addEventListener("mousedown", checkIfClickedOutside);

      return () => {
        document.removeEventListener("mousedown", checkIfClickedOutside);
      };
    }
  }, [openModal]);
};

export { useBackgroundClick };
