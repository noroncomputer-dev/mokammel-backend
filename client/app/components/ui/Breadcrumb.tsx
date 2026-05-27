import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronLeft className="w-4 h-4" />}
          {index === items.length - 1 ? (
            <span className="text-gray-900 dark:text-white font-medium">
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className="hover:text-primary transition">
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
