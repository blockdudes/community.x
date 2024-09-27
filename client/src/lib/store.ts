import { configureStore } from '@reduxjs/toolkit';
import FetchPrivateSpaceReducer from './features/FetchPrivateSpaceSlice';
import FetchAllPostReducer from './features/FetchAllPostSlice';
import FetchAllUsersReducer from './features/FetchAllUsersSlice';
export const makeStore = () => {
    return configureStore({
        reducer: {
            fetchPrivateSpace: FetchPrivateSpaceReducer,
            fetchAllPost: FetchAllPostReducer,
            fetchAllUser: FetchAllUsersReducer,
        },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware({
            serializableCheck: false,
        }),
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']