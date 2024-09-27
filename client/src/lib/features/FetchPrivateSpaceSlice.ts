"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { intialPrivateSpaceType, privateSpaceType } from "@/types/privateTypes";
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
        const updateState = (state: intialPrivateSpaceType, privateSpace: privateSpaceType[] | null, error: string | null, loading: boolean) => {
            state.privateSpace = privateSpace;
            state.error = error;
            state.loading = loading;
        }
        builder
            .addCase(fetchPrivateSpace.pending, (state) => updateState(state, null, null, true))
            .addCase(fetchPrivateSpace.fulfilled, (state, action) => updateState(state, action.payload?.privateSpaces ?? null, null, false))
            .addCase(fetchPrivateSpace.rejected, (state, action) => updateState(state, null, action.payload as string, false))
    },
    reducers: {}
})

export default fetchPublicSpaceSlice.reducer;