import type { Metadata } from "next";
import { DemoBanner } from "@/components/demo-banner";
import "./globals.css";

export const metadata: Metadata = {
  title: "English Lab",
  description: "Middle school English learning platform — NE능률 Lessons 5–8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard/dist/web/static/pretendard.css"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Noto+Serif+KR:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <DemoBanner />
        {children}
      </body>
    </html>
  );
}
