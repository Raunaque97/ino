import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
//@ts-ignore
import truncateMiddle from "truncate-middle";
export function shorten(
  str: string,
  first: number = 7,
  last: number = 7,
  pattern: string = "...",
) {
  return truncateMiddle(str, first, last, pattern);
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
