import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "팀장 자기효능감 강화 AI 시뮬레이션",
  description:
    "부서장이 팀장과의 실제 대화 상황을 연습하며 자기효능감 강화 행동을 훈련하는 기업 리더십 교육 시뮬레이션",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
