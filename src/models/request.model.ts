import mongoose, { Schema, model, Types, Document } from "mongoose";
import { models } from "mongoose";

export interface Request extends Document {
  requestType: "chat" | "follow";
  status: "pending" | "accepted" | "rejected";
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
}

const schema = new Schema(
  {
    requestType: {
      type: String,
      required: true,
      enum: ["chat", "follow"],
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "accepted", "rejected"],
    },
    sender: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const RequestModel = models?.Request || model<Request>("Request", schema);
