import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Splitwise Clone | Track and Split Expenses",
  description: "A simple and intuitive expense sharing app to track bills and settle up with friends and family.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50`}>
        <div className="flex flex-col h-full">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="container mx-auto max-w-7xl">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
