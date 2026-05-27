import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Props {
  title: string;
  subtitle?: string;
  linkHref?: string;
  linkText?: string;
}

export default function SectionHeader({
  title,
  subtitle,
  linkHref = "#",
  linkText = "مشاهده همه",
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8" dir="rtl">
      <div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="text-muted-foreground mt-2 text-sm md:text-base leading-7">
            {subtitle}
          </p>
        )}
        <div className="divider-gold mt-3" />
      </div>
      {linkHref && (
        <Link
          href={linkHref}
          className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all group shrink-0"
        >
          {linkText}
          <ArrowLeft size={16} />
        </Link>
      )}
    </div>
  );
}
