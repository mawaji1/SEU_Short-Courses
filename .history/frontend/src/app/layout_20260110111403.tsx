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
    icon: '/images/new-logo.png',
    shortcut: '/images/new-logo.png',
    apple: '/images/new-logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${tajawal.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
