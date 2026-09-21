import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeProvider } from "next-themes";
import { QueryProvider } from "../contexts/query-client.provider";
import { Toaster } from "../components/ui/sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", });

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], });

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], });

export const metadata: Metadata = {
  title: "Templete Projetos", description: "Boilerplate interno multi-schema (core + app)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans" suppressHydrationWarning={true}>
        <ThemeProvider attribute='class' defaultTheme="black" enableSystem={false} themes={["light", "dark", "black"]}>
          <QueryProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster richColors closeButton />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
