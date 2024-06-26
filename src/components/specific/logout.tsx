"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export function SignOut() {
  return (
    <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <Button
              className="grow justify-start"
              variant={"destructive"}
              onClick={async () => await signOut()}
            >
              <LogOut className="mr-4 h-4 w-4" />
              Logout
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            Logout
          </TooltipContent>
        </Tooltip>
      </nav>
    </div>
  );
}
