import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import { plusJakartaSans, bricolageGrotesque } from "./fonts";
import Loading from "./loading";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { AuthProvider } from "@/lib/context/auth";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://codetoflows.com"),
  title: {
    default: "CodetoFlows - Transform Code into Beautiful Flowcharts Instantly",
    template: "%s | CodetoFlows",
  },
  description:
    "Transform your code into beautiful, interactive flowcharts instantly with AI-powered visualization. Support for Python, JavaScript, Java, SQL, and more.",
  keywords: [
    "code visualization",
    "flowchart generator",
    "code to flowchart",
    "AI flowchart",
    "code documentation",
    "developer tools",
    "programming tools",
  ],
  authors: [{ name: "CodetoFlows" }],
  creator: "CodetoFlows",
  publisher: "CodetoFlows",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://codetoflows.com",
    siteName: "CodetoFlows",
    title: "CodetoFlows - Transform Code into Beautiful Flowcharts Instantly",
    description:
      "Transform your code into beautiful, interactive flowcharts instantly with AI-powered visualization. Support for Python, JavaScript, Java, SQL, and more.",
    images: [
      {
        url: "https://www.codetoflows.com/Codetoflows-OG.jpg",
        width: 1200,
        height: 630,
        alt: "CodetoFlows - Code to Flowchart Visualization",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CodetoFlows - Transform Code into Beautiful Flowcharts Instantly",
    description:
      "Transform your code into beautiful, interactive flowcharts instantly with AI-powered visualization.",
    images: ["https://codetoflows.com/Codetoflows-OG.jpg"],
    creator: "@codetoflows",
  },
  icons: {
    icon: [{ rel: "icon", url: "/favicon.png" }],
  },
  manifest: "/site.webmanifest",
  alternates: {
    canonical: "https://codetoflows.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="canonical" href="https://codetoflows.com" />
        <link
          rel="preload"
          href="/Codetoflows.svg"
          as="image"
          type="image/svg+xml"
        />
        <link rel="icon" href="/favicon.png" sizes="32x32" />
      </head>
      <body
        className={`${plusJakartaSans.variable} ${bricolageGrotesque.variable} antialiased bg-[#fbf9f6]`}
        suppressHydrationWarning
      >
        <AuthProvider>
          <Suspense fallback={<Loading />}>{children}</Suspense>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
