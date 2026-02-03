import clsx, { ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...args: ClassValue[]) => {
  return twMerge(clsx(args));
};

export type SizeInRem =
  | `${| 0.75
  | 0.875
  | 1
  | 1.25
  | 1.5
  | 1.75
  | 1.875
  | 2
  | 2.25
  | 2.5
  | 2.75
  | 3
  | 3.25
  | 3.5}rem`
  | (`${number}rem` & NonNullable<unknown>);

export const getCookie = (name: string): string | undefined => {
  if (typeof document === "undefined") return undefined;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
};

