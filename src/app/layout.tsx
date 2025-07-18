import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PromptBox - AI Prompt Management",
  description: "Create, manage, and organize your AI prompts with PromptBox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  );
}
