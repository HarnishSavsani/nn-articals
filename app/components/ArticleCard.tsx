import Link from 'next/link';
import { IconArrowRight } from './Icons';

interface ArticleCardProps {
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  href?: string;
  featured?: boolean;
}

export default function ArticleCard({
  title,
  excerpt,
  category,
  date,
  readTime,
  href,
}: ArticleCardProps) {
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`group block rounded-xl border border-border bg-surface p-5 transition-all sm:p-6 ${
        href
          ? 'cursor-pointer hover:border-nexus-500/40 hover:shadow-lg hover:shadow-nexus-500/5'
          : 'cursor-default'
      }`}
    >
      <div className="mb-3">
        <span className="inline-block rounded-full bg-nexus-500/10 px-3 py-1 text-xs font-medium text-nexus-500">
          {category}
        </span>
      </div>
      <h3
        className={`mb-2 text-lg font-semibold text-foreground transition-colors ${
          href ? 'group-hover:text-nexus-500' : ''
        }`}
      >
        {title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-muted">
        {excerpt}
      </p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>{date}</span>
          <span>·</span>
          <span>{readTime}</span>
        </div>
        {href && (
          <span className="flex items-center gap-1 text-xs font-medium text-nexus-500 opacity-0 transition-opacity group-hover:opacity-100">
            Read more <IconArrowRight size={12} />
          </span>
        )}
      </div>
    </Wrapper>
  );
}
