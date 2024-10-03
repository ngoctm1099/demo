import React from "react";
import Button from "../../../Button";
import Modal from "../../../Modal";

interface DeleteGuestModalProps {
  openModal?: boolean;
  setOpenModal?: (val: boolean) => void;
  deleteGuest?: any;
  guest?: any;
}

const DeleteGuestModal = ({ openModal, setOpenModal, guest, deleteGuest }: DeleteGuestModalProps) => {
  const guestName = guest?.firstName ? `${guest.firstName} ${guest.lastName}` : guest?.email || "guest";

  return (
    <Modal
      open={openModal}
      setOpen={setOpenModal}
      header={`Delete ${guestName}`}
      className="!max-w-sm"
      body={
        <div className="w-full flex justify-evenly gap-4">
          <Button
            title="Cancel"
            className="text-rose-600 border-2 border-rose-500 mb-4 sm:mb-0 hover:text-rose-800 hover:border-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
            onClick={() => setOpenModal(false)}
          />
          <Button
            title="Delete"
            className="text-white bg-rose-600 mb-4 sm:mb-0 hover:bg-rose-700 rounded-md text-xs sm:text-sm tracking-wider font-medium h-10 w-full"
            onClick={deleteGuest}
          />
        </div>
      }
    />
  );
};

export default DeleteGuestModal;
