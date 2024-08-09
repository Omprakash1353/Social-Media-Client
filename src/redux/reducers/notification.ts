import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getOrSaveFromStorage } from "@/hooks/useLocalStorage";
import { RootState } from "../store";

interface MessageAlert {
  chatId: string;
  count: number;
}

interface NotificationState {
  notificationCount: number;
  newMessagesAlert: MessageAlert[];
}

const initialState: NotificationState = {
  notificationCount: 0,
  newMessagesAlert: getOrSaveFromStorage({
    key: "NEW_MESSAGE_ALERT",
    get: true,
  }) || [
    {
      chatId: "",
      count: 0,
    },
  ],
};

const notificationSlice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    incrementNotification: (state) => {
      state.notificationCount += 1;
    },
    resetNotificationCount: (state) => {
      state.notificationCount = 0;
    },
    setNewMessagesAlert: (state, action: PayloadAction<{ chatId: string }>) => {
      const { chatId } = action.payload;

      const index = state.newMessagesAlert.findIndex(
        (item) => item.chatId === chatId,
      );

      if (index !== -1) {
        state.newMessagesAlert[index].count += 1;
      } else {
        state.newMessagesAlert.push({
          chatId,
          count: 1,
        });
      }
    },
    removeNewMessagesAlert: (state, action: PayloadAction<string>) => {
      state.newMessagesAlert = state.newMessagesAlert.filter(
        (item) => item.chatId !== action.payload,
      );
    },
  },
});

export default notificationSlice;

export const selectNotificationCount = (state: RootState) =>
  state.notification.notificationCount;

export const selectNewMessagesAlert = (state: RootState) =>
  state.notification.newMessagesAlert;

export const {
  incrementNotification,
  resetNotificationCount,
  setNewMessagesAlert,
  removeNewMessagesAlert,
} = notificationSlice.actions;
