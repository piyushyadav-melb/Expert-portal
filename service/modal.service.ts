import { closeModal, openModal } from "@/redux/slice/modal.slice";
import { store } from "@/redux/store";


// Function to open popup
export const openPopup = async (modalName: string, modalTitle: string, action: string, data?: any) => {
    try {
        store.dispatch(openModal({ modalName, modalTitle, action, data }));
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Something went wrong."
        );
    }
};


//Function to close popup
export const closePopup = async () => {
    try {
        store.dispatch(closeModal());
    } catch (error: any) {
        throw new Error(
            error.response?.data?.message || "Something went wrong."
        );
    }
};