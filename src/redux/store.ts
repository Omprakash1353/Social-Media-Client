import { configureStore } from "@reduxjs/toolkit";
import videoChatSlice from "./reducers/video-call";
import notificationSlice from "./reducers/notification";

export const store = configureStore({
  reducer: {
    [videoChatSlice.name]: videoChatSlice.reducer,
    [notificationSlice.name]: notificationSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
