import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تواصل معنا | التعليم التنفيذي - SEU",
    description: "تواصل مع فريق التعليم التنفيذي بالجامعة السعودية الإلكترونية. نسعد بالرد على استفساراتك حول البرامج التدريبية والتسجيل.",
    openGraph: {
        title: "تواصل معنا | التعليم التنفيذي",
        description: "تواصل مع فريق التعليم التنفيذي بالجامعة السعودية الإلكترونية",
        type: "website",
    },
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
