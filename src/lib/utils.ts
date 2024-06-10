import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getTime(date: string | Date) {
  const utcTime = new Date(date);
  const currentTime = Date.now();
  const timeDiff = currentTime - utcTime.getTime();

  const millisecondsInWeek = 1000 * 60 * 60 * 24 * 7;
  const weeksDiff = Math.floor(timeDiff / millisecondsInWeek);
  const daysDiff = Math.floor(
    (timeDiff % millisecondsInWeek) / (1000 * 60 * 60 * 24),
  );
  const hoursDiff = Math.floor(
    (timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutesDiff = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

  let maxUnit;
  let maxTimeValue;
  if (weeksDiff > 0) {
    maxUnit = "w";
    maxTimeValue = weeksDiff;
  } else if (daysDiff > 0) {
    maxUnit = "d";
    maxTimeValue = daysDiff;
  } else if (hoursDiff > 0) {
    maxUnit = "hr";
    maxTimeValue = hoursDiff;
  } else {
    maxUnit = "m";
    maxTimeValue = minutesDiff;
  }

  return `${maxTimeValue} ${maxUnit}`;
}
