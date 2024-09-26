"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { intialPrivateSpaceType } from "@/types/privateTypes";
import axios from "axios";

const intialPrivateSpace: intialPrivateSpaceType = {
    privateSpace: null,
    loading: false,
    error: null
}

export const fetchPrivateSpace = createAsyncThunk("private_space", async (_, { rejectWithValue }) => {
    try {
        let resp = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/get/private/space/all`);
        return {
            privateSpaces: resp.data?.privateSpaces
        }
    } catch (error) {
        return rejectWithValue(error);
    }
})

const fetchPublicSpaceSlice = createSlice({
    name: "Fetch Public Space",
    initialState: intialPrivateSpace,
    extraReducers: builder => {
        builder.addCase(fetchPrivateSpace.pending, (state) => {
            state.loading = true;
        })
        builder.addCase(fetchPrivateSpace.fulfilled, (state, action) => {
            state.loading = false;
            state.privateSpace = action.payload?.privateSpaces ?? null;
            state.error = null;
        })
        builder.addCase(fetchPrivateSpace.rejected, (state, action) => {
            state.loading = false;
            state.privateSpace = null;
            state.error = action.payload as string;;
        })
    },
    reducers: {}
})

export default fetchPublicSpaceSlice.reducer;