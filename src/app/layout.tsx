import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Muslim Gunawan | Software Engineer & Informatics Student",
  description:
    "Portofolio resmi Muslim Gunawan (MusGun) - Mahasiswa Teknik Informatika Universitas Malikussaleh (UNIMAL) Semester 5. Spesialis Mobile (Flutter), Fullstack Web (Laravel & Next.js), serta Data Analytics.",
  keywords: [
    "Muslim Gunawan",
    "MusGun",
    "Universitas Malikussaleh",
    "UNIMAL",
    "Flutter Developer",
    "Laravel Fullstack",
    "Next.js Portfolio",
    "Informatics Engineering",
  ],
  authors: [{ name: "Muslim Gunawan" }],
  icons: {
    icon: "/logo_unimal.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark scroll-smooth">
      <head>
        {/* banna.js script without data-once="session" so it builds on every refresh & replay */}
        <script
          src="/banna.js"
          data-speed="1"
          data-agents="7"
          data-credit="false"
          data-colors="#38bdf8,#818cf8,#34d399,#f472b6,#fbbf24,#a78bfa,#f87171"
        ></script>
      </head>
      <body
        className={`${jakartaSans.variable} ${jetbrainsMono.variable} font-sans min-h-screen bg-[#06080d] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200`}
      >
        {children}
      </body>
    </html>
  );
}
