import { Session } from "next-auth";

export type useServerAuthType =
  | (Session & {
      user: {
        name: string;
        _id: string;
        email: string;
        role: "USER" | "ADMIN";
      };
    })
  | null;

export type useServerSessionType = {
  name: string;
  _id: string;
  email: string;
  role: "USER" | "ADMIN";
};
