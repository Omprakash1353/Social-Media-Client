import { getServerSession } from "next-auth";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { useServerAuthType } from "@/types/server-components";

/**
 * Function to get the server session asynchronously
 * @returns A promise resolving to a useServerAuthType
 */
export async function useServerSession(): Promise<useServerAuthType> {
  return await getServerSession(authOptions);
}
