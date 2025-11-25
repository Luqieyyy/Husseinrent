import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar"; // <--- Ensure this line is here

export const metadata: Metadata = {
  title: "HusseinRent",
  description: "Student Housing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}