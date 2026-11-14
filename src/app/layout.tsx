import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Muslim Gunawan // Software Engineer & Systems Builder",
  description:
    "Official portfolio of Muslim Gunawan (MusGun) - Informatics Engineering, Universitas Malikussaleh (UNIMAL). Specializing in high-performance Mobile Engineering (Flutter), Modern Full-Stack (Laravel, Next.js), and Spatial Intelligence.",
  keywords: [
    "Muslim Gunawan",
    "MusGun",
    "Software Engineer",
    "Flutter Developer",
    "Laravel Fullstack",
    "Next.js 16",
    "Universitas Malikussaleh",
    "UNIMAL",
    "Portfolio",
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
    <html lang="id" data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        {/* Anti-flicker theme initialization script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('musgun_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark) || !saved) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Production-ready banna.js script */}
        <script
          src="/banna.js"
          data-speed="1.2"
          data-agents="7"
          data-credit="false"
          data-colors="#38bdf8,#f59e0b,#10b981,#818cf8,#c084fc,#2dd4bf,#fb7185"
        ></script>
      </head>
      <body
        className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen antialiased transition-colors duration-300 selection:bg-cyan-500/30 selection:text-cyan-400`}
      >
        {children}
      </body>
    </html>
  );
}
