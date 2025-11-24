import type { Metadata } from "next";
import { Inter, Poppins } from 'next/font/google';
import "./globals.css";

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const poppins = Poppins({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: "TAMI - Your AI Task Assistant",
  description: "Voice-first intelligent task management powered by AI",
  icons: {
    icon: '/favicon.png',
    apple: '/tami-logo.png',
  },
  openGraph: {
    title: "TAMI - Your AI Task Assistant",
    description: "Voice-first intelligent task management powered by AI",
    images: ['/tami-logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${poppins.variable}`}>{children}</body>
    </html>
  );
}
