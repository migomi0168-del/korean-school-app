import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fontData = await readFile(join(process.cwd(), "assets/fonts/Jua-Regular.ttf"));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#fffaf0",
          fontFamily: "Noto Sans KR",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-end", gap: 36 }}>
          <span style={{ fontSize: 90 }}>🦊</span>
          <span style={{ fontSize: 90 }}>🐰</span>
          <span style={{ fontSize: 160 }}>🏫</span>
          <span style={{ fontSize: 90 }}>🐼</span>
          <span style={{ fontSize: 90 }}>🐧</span>
        </div>
        <div style={{ marginTop: 28, fontSize: 76, fontWeight: 400, color: "#4caf00" }}>
          학교생활 언어 마스터
        </div>
        <div style={{ marginTop: 16, fontSize: 34, color: "#3c3c3c" }}>
          다문화 초등학생을 위한 학교생활 한국어 학습 앱
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Sans KR", data: fontData, style: "normal", weight: 400 }] }
  );
}
