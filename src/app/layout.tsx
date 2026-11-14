import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Syne } from "next/font/google";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
  weight: ["700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600"],
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
        {/* Anti-flicker theme & anti-FOUC zero-flash inline styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `html.sb-loading main { opacity: 0 !important; pointer-events: none; }`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  document.documentElement.classList.add('sb-loading');
                  var saved = localStorage.getItem('musgun_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && prefersDark) || !saved) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                  // Failsafe in case script loading is delayed
                  setTimeout(function() {
                    document.documentElement.classList.remove('sb-loading');
                  }, 4000);
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Production-ready banna.js script */}
        <script
          src="/banna.js"
          data-auto="false"
          data-speed="0.85"
          data-agents="7"
          data-credit="false"
          data-colors="#f59e0b,#38bdf8,#10b981,#818cf8,#0ea5e9,#2dd4bf,#fb7185"
        ></script>
      </head>
      <body
        className={`${syne.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} min-h-screen antialiased transition-colors duration-300 selection:bg-cyan-500/30 selection:text-cyan-400`}
      >
        {children}
      </body>
    </html>
  );
}
