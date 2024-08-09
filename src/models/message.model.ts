import mongoose, { Schema, model, Types, Document } from "mongoose";

export interface Message extends Document {
  content: string;
  attachments: { public_id: string; url: string }[];
  sender: Types.ObjectId;
  chat: Types.ObjectId;
}

const schema = new Schema(
  {
    content: String,
    attachments: [
      {
        public_id: {
          type: String,
          required: true,
        },
        secure_url: {
          type: String,
          required: true,
        },
      },
    ],
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Types.ObjectId,
      ref: "Chat",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const MessageModel =
  mongoose.models?.Message || model<Message>("Message", schema);
