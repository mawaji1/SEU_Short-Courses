import { Metadata } from "next";

export const metadata: Metadata = {
    title: "الأسئلة الشائعة | التعليم التنفيذي",
    description: "إجابات على الأسئلة الشائعة حول برامج التعليم التنفيذي بالجامعة السعودية الإلكترونية. التسجيل، الدفع، الشهادات، والدعم الفني.",
    openGraph: {
        title: "الأسئلة الشائعة | التعليم التنفيذي",
        description: "إجابات على الأسئلة الشائعة حول برامج التعليم التنفيذي",
        type: "website",
    },
};

export default function FAQLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
