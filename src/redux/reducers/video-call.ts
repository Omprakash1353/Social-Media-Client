import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface VideoChatState {
  currentUserSocketId: string;
  remoteUserSocketId: string;
}

const initialState: VideoChatState = {
  currentUserSocketId: "",
  remoteUserSocketId: "",
};

const videoChatSlice = createSlice({
  name: "videoChat",
  initialState,
  reducers: {
    setCurrentUserSocketId: (state, action: PayloadAction<string>) => {
      state.currentUserSocketId = action.payload;
    },
    setRemoteUserSocketId: (state, action: PayloadAction<string>) => {
      state.remoteUserSocketId = action.payload;
    },
  },
});

export default videoChatSlice;

export const selectCurrentUserSocketId = (state: RootState) =>
  state.videoChat.currentUserSocketId;

export const selectRemoteUserSocketId = (state: RootState) =>
  state.videoChat.remoteUserSocketId;

export const { setCurrentUserSocketId, setRemoteUserSocketId } =
  videoChatSlice.actions;
