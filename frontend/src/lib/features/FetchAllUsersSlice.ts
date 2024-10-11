"use client"
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

type intialUsersStateType = {
    users: any[];
    error: string | null;
    loading: boolean;
}

const intialUsersState: intialUsersStateType = {
    users: [],
    error: null,
    loading: false
}

export const fetchAllUsers = createAsyncThunk("fetch_users", async (_, { rejectWithValue }) => {
    try {
        const data = (await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/api/user/get/all/users`)).data;
        return { users: data.users }
    } catch (error) {
        return rejectWithValue(error as string);
    }
})

const fetchAllUsersSlice = createSlice({
    name: "Users Slice",
    initialState: intialUsersState,
    extraReducers: builder => {
        const updateState = (state: intialUsersStateType, users: any[], error: string | null, loading: boolean) => {
            state.users = users;
            state.error = error;
            state.loading = loading;
        }
        builder
            .addCase(fetchAllUsers.pending, (state) => updateState(state, [], null, true))
            .addCase(fetchAllUsers.fulfilled, (state, action) => updateState(state, action.payload?.users ?? [], null, false))
            .addCase(fetchAllUsers.rejected, (state, action) => updateState(state, [], action.payload as string, false))
    },
    reducers: {}
})

export default fetchAllUsersSlice.reducer;