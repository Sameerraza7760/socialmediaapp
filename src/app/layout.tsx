import { ReactQueryProvider } from "@/providers/ReactQueryProvider";
import { getDbUserId, syncUser } from "@/actions/user.action";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { SocketProvider } from "@/context/SocketContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "react-hot-toast";
import localFont from "next/font/local";
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";

import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Socially",
  description: "A modern social media application powered by Next.js",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();
  if (user) await syncUser();
  const dbUserId = await getDbUserId();

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ReactQueryProvider>
              {dbUserId ? (
                <SocketProvider userId={dbUserId}>
                  <LayoutContent>{children}</LayoutContent>
                </SocketProvider>
              ) : (
                <LayoutContent>{children}</LayoutContent>
              )}
              <Toaster />
            </ReactQueryProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}

function LayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>
            <div className="lg:col-span-9">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
