import { Metadata } from "next";

export const metadata: Metadata = {
    title: "تصفح البرامج التدريبية | التعليم التنفيذي",
    description: "استعرض جميع البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية. برامج في القيادة والإدارة والتقنية والتطوير المهني.",
    openGraph: {
        title: "تصفح البرامج التدريبية | التعليم التنفيذي",
        description: "استعرض جميع البرامج التدريبية المعتمدة من الجامعة السعودية الإلكترونية",
        type: "website",
    },
};

export default function ProgramsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
