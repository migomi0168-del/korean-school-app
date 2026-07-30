import type { Metadata } from "next";
import { Jua, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { StudentSessionProvider } from "@/hooks/useStudentSession";
import { TeacherAuthProvider } from "@/hooks/useTeacherAuth";
import { HomeButton } from "@/components/common/HomeButton";
import { StudyTimeTracker } from "@/components/home/StudyTimeTracker";
import { TopStudentCelebration } from "@/components/home/TopStudentCelebration";

const displayFont = Jua({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
});

const notoSansKr = Noto_Sans_KR({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://korean-school-app-topaz.vercel.app"),
  title: "학교생활 언어 마스터",
  description: "다문화 초등학생을 위한 학교생활 한국어 학습 앱",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${displayFont.variable} ${notoSansKr.variable} h-full`}>
      <body className="min-h-full flex flex-col overflow-x-hidden bg-cream text-ink font-body">
        <TeacherAuthProvider>
          <StudentSessionProvider>
            <HomeButton />
            <StudyTimeTracker />
            <TopStudentCelebration />
            <div className="mx-auto w-full max-w-md flex-1 flex flex-col">{children}</div>
          </StudentSessionProvider>
        </TeacherAuthProvider>
      </body>
    </html>
  );
}
