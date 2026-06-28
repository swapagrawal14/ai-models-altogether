import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AI Model Selector",
  description: "Chat with any AI model from any provider",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white">{children}</body>
    </html>
  )
}
