/* eslint-disable react-hooks/exhaustive-deps */
import classnames from "classnames";
import { AnimatePresence, motion } from "framer-motion";
import React, { useRef } from "react";
import { useBackgroundClick } from "../../hooks/useBackgroundClick";
import Button from "../Button";

interface ModalProps {
  header: React.ReactNode | string;
  body?: React.ReactNode | string;
  footer?: React.ReactNode | string;
  open: boolean;
  disabledBackgroundClick?: boolean;
  setOpen: (value: boolean) => void;
  onClose?: any;
  className?: string;
}

const Modal = ({ header, body, footer, open, setOpen, disabledBackgroundClick, onClose, className }: ModalProps) => {
  const modalRef = useRef<HTMLDivElement>();
  const handleExitModal = () => {
    if (onClose) onClose();
    setOpen(false);
  };

  useBackgroundClick(modalRef, open, setOpen, disabledBackgroundClick);

  return (
    <AnimatePresence>
      {open && (
        <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="fixed inset-0 bg-gray-800 bg-opacity-75 transition-opacity"></div>
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center md:p-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full flex items-center justify-center"
              >
                <div
                  ref={modalRef}
                  className={classnames(
                    "w-full relative transform rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg",
                    className
                  )}
                >
                  <div className="p-4 sm:p-6">
                    <div className="flex justify-between items-center">
                      <h3
                        className="text-sm sm:text-lg font-medium leading-6 text-gray-600 whitespace-nowrap text-ellipsis overflow-hidden"
                        id="modal-title"
                      >
                        {header}
                      </h3>
                      <div>
                        <Button
                          onClick={handleExitModal}
                          className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                          title={
                            <svg
                              aria-hidden="true"
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          }
                        />
                      </div>
                    </div>
                  </div>
                  {body && <div className="pb-4 sm:pb-6 px-4 sm:px-6">{body}</div>}
                  {footer && <div className="mt-2 pb-6 px-6">{footer}</div>}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
