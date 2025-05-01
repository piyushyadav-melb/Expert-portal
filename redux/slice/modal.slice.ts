import { createSlice, PayloadAction } from "@reduxjs/toolkit";


const initialState: any = {
    isLoading: false,
    isOpen: false,
    modalName: "",
    modalTitle: "",
    action: "",
    data: null,
    error: {},
};

export const modal = createSlice({
    name: "modal",
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<any>) => {
            state.isOpen = true
            state.modalName = action.payload?.modalName
            state.modalTitle = action.payload?.modalTitle
            state.action = action.payload?.action
            state.data = action.payload?.data
        },
        closeModal: (state) => {
            state.isOpen = initialState.isOpen
            state.modalName = initialState.modalName
            state.modalTitle = initialState.modalTitle
            state.action = initialState.action
        },
    },
    extraReducers: (builder: any) => {
    },
});

export const {
    openModal,
    closeModal,
} = modal.actions;

export default modal.reducer;
