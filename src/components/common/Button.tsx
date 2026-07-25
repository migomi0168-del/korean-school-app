"use client";

import { ButtonHTMLAttributes } from "react";

type Variant = "green" | "blue" | "yellow" | "pink" | "gray";

const VARIANT_CLASSES: Record<Variant, string> = {
  green: "bg-duo-green border-duo-green-dark text-white",
  blue: "bg-duo-blue border-duo-blue-dark text-white",
  yellow: "bg-duo-yellow border-duo-yellow-dark text-ink",
  pink: "bg-duo-pink border-duo-pink-dark text-white",
  gray: "bg-white border-duo-gray text-ink",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  fullWidth?: boolean;
}

export function Button({
  variant = "green",
  fullWidth = true,
  className = "",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`duo-btn rounded-2xl border-2 px-6 py-3 text-lg font-bold font-display cursor-pointer ${VARIANT_CLASSES[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
