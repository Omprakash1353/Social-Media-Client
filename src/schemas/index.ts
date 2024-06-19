import { z } from "zod";

export const SignInSchema = z.object({
  email: z.string().toLowerCase().email({ message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must of atleast 6 characters" }),
});
export type SignInSchemaType = z.infer<typeof SignInSchema>;

export const SignUpSchema = z.object({
  name: z
    .string()
    .toLowerCase()
    .min(3, { message: "name must be of atleast 3 characters" })
    .regex(new RegExp("^[a-zA-Z]+$")),
  email: z.string().toLowerCase().email({ message: "Email is required" }),
  password: z
    .string()
    .min(6, { message: "Password must of atleast 6 characters" }),
});
export type SignUpSchemaType = z.infer<typeof SignUpSchema>;

export const PostFormSchema = z
  .object({
    caption: z.string().optional(),
    location: z.string().optional(),
    isCommentOn: z.boolean().default(false).optional(),
    isLikesAndCommentVisible: z.boolean().default(false).optional(),
    hashTags: z.array(z.string()).optional(),
    media: z.array(z.instanceof(File)).optional(),
  })
  .refine(
    (data) =>
      data.caption?.trim() !== "" || (data.media && data.media.length > 0),
    {
      message: "Either content or media must be provided",
      path: ["content", "media"],
    },
  );

export type PostFormSchemaType = z.infer<typeof PostFormSchema>;

export const appearanceFormSchema = z.object({
  theme: z.enum(["light", "dark", "system"], {
    required_error: "Please select a theme.",
  }),
});

export type AppearanceFormValues = z.infer<typeof appearanceFormSchema>;

export const accountFormSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: "Username must be at least 2 characters.",
    })
    .max(30, {
      message: "Username must not be longer than 30 characters.",
    })
    .optional(),
  bio: z
    .string()
    .min(5, {
      message: "Bio must be at least 5 characters.",
    })
    .max(150, {
      message: "Bio must not be longer than 150 characters.",
    })
    .optional(),
  gender: z.enum(["MALE", "FEMALE"]).optional(),
  avatar: z.instanceof(File).optional(),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;