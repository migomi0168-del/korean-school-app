"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStudentSession } from "@/hooks/useStudentSession";
import { requestGoHome } from "@/lib/navGuard";

const HIDDEN_PREFIXES = ["/login", "/onboarding", "/home", "/teacher"];

export function HomeButton() {
  const pathname = usePathname();
  const router = useRouter();
  const { student } = useStudentSession();

  if (!student) return null;
  if (pathname === "/" || HIDDEN_PREFIXES.some((p) => pathname.startsWith(p))) return null;

  return (
    <button
      onClick={() => requestGoHome(router)}
      aria-label="홈으로"
      className="fixed right-3 top-3 z-40 flex h-10 w-10 items-center justify-center rounded-full border-2 border-duo-gray bg-white text-xl shadow-md active:scale-95"
    >
      🏠
    </button>
  );
}
