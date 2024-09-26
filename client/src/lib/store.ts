import { configureStore } from '@reduxjs/toolkit'
import FetchPrivateSpaceReducer from './features/FetchPrivateSpaceSlice'

export const makeStore = () => {
    return configureStore({
        reducer: {
            fetchPrivateSpace: FetchPrivateSpaceReducer
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']