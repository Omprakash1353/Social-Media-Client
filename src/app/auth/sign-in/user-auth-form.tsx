"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/shared/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, SignInSchemaType } from "@/schemas";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { toast } from "sonner";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
	callbackUrl?: string;
}

export function UserAuthForm({
	className,
	callbackUrl,
	...props
}: UserAuthFormProps) {
	const [isLoading, setIsLoading] = React.useState<boolean>(false);
	const router = useRouter();

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting, isValid },
	} = useForm<SignInSchemaType>({
		resolver: zodResolver(SignInSchema),
	});

	const onSubmit: SubmitHandler<SignInSchemaType> = async (data) => {
		const response = await signIn("credentials", { ...data, redirect: false });

		if (!response?.ok) {
			toast.error("Something went wrong");
			return;
		}

		toast.success("Signed In successfully");
		router.push(callbackUrl || "/");
	};

	return (
		<div className={cn("grid gap-6", className)} {...props}>
			<form onSubmit={handleSubmit(onSubmit)}>
				<div className="grid gap-2">
					<div className="grid gap-1">
						<Label className="sr-only" htmlFor="email">
							Email
						</Label>
						<Input
							id="email"
							placeholder="name@example.com"
							type="email"
							{...register("email")}
							autoCapitalize="none"
							autoComplete="email"
							autoCorrect="off"
							disabled={isSubmitting}
						/>
						{errors.email && errors.email.message}
					</div>
					<div className="grid gap-1">
						<Label className="sr-only" htmlFor="password">
							Password
						</Label>
						<Input
							id="password"
							placeholder="********"
							type="password"
							{...register("password")}
							autoCapitalize="none"
							autoComplete="password"
							autoCorrect="off"
							disabled={isSubmitting}
						/>
						{errors.password && errors.password.message}
					</div>
					<Button type="submit" disabled={isSubmitting || !isValid}>
						{isSubmitting && (
							<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
						)}
						Sign In with Email
					</Button>
				</div>
			</form>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<Button variant="outline" type="button" disabled={isLoading}>
				{isLoading ? (
					<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Icons.google className="mr-2 h-4 w-4" />
				)}{" "}
				Google
			</Button>
			<Button variant="outline" type="button" disabled={isLoading}>
				{isLoading ? (
					<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
				) : (
					<Icons.gitHub className="mr-2 h-4 w-4" />
				)}{" "}
				GitHub
			</Button>
		</div>
	);
}
