import Link from "next/link";

export function CourseGroupContext({ name }: { name: string }) {
  return <Link className="course-group-context" href="/library" aria-label={`当前课程组：${name}，前往课程库切换`}><span>当前课程组</span><strong>{name}</strong><span aria-hidden="true">↗</span></Link>;
}
