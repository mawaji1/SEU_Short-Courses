import type { Metadata } from "next";
import { Tajawal } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const tajawal = Tajawal({
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  subsets: ["arabic", "latin"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "التدريب الاحترافي - الجامعة السعودية الإلكترونية",
  description: "اكتشف أفضل البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية. تعلم عن بُعد واحصل على شهادة معتمدة.",
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/images/new-logo.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/images/new-logo.png" type="image/png" />
      </head>
      <body className={`${tajawal.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
