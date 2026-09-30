import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    items: [],
};

const brandsSlice = createSlice({
    name: 'brands',

    initialState,

    reducers: {
        setBrands: (state, action) => {
            state.items = action.payload || [];
        },

        addBrand: (state, action) => {
            if (action.payload) {
                state.items.unshift(action.payload);
            }
        },

        updateBrand: (state, action) => {
            const updatedBrand = action.payload;

            const index = state.items.findIndex(
                (brand) => brand._id === updatedBrand._id
            );

            if (index !== -1) {
                state.items[index] = updatedBrand;
            }
        },

        removeBrand: (state, action) => {
            state.items = state.items.filter(
                (brand) => brand._id !== action.payload
            );
        },
    },
});

export const {
    setBrands,
    addBrand,
    updateBrand,
    removeBrand,
} = brandsSlice.actions;

export default brandsSlice.reducer;