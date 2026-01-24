import { LearnerShell } from '@/components/learner';

export default function LearnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearnerShell>{children}</LearnerShell>;
}
