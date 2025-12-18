import type { Metadata } from "next";
import "./globals.css";
import { HabitProvider } from "@/context/HabitContext";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits and build better routines",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen">
        <HabitProvider>
          {children}
        </HabitProvider>
      </body>
    </html>
  );
}
