import clsx from "clsx";

export function cn(...inputs) {
  return clsx(inputs);
}

export const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition";

export const buttonPrimary =
  "w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all px-4 py-3 font-medium text-white shadow-lg shadow-indigo-900/30";

export const buttonSecondary =
  "w-full rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all px-4 py-3 font-medium text-white";