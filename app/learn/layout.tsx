import { notFound } from "next/navigation";
import LessonSidebar from "@/components/LessonSidebar";
import { getCourseWithStructure } from "@/db/queries";
import { COURSE_SLUG } from "@/lib/config";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const course = await getCourseWithStructure(COURSE_SLUG);
  if (!course) notFound();

  return (
    <div className="md:grid md:h-screen md:grid-cols-[300px_1fr]">
      <LessonSidebar structure={course} />
      <main className="md:h-screen md:overflow-y-auto">{children}</main>
    </div>
  );
}
