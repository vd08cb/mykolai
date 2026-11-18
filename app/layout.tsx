import type { Metadata, Viewport } from "next";
import { Manrope, Unbounded } from "next/font/google";
import "./globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic"], weight: ["500", "700"], variable: "--font-display" });
const body = Manrope({ subsets: ["latin", "cyrillic"], weight: ["400", "600", "700"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "Вішліст до Миколая",
  description: "Обери подарунок і забронюй його, щоб ніхто не купив те саме.",
};

export const viewport: Viewport = {
  themeColor: "#0b1630",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
