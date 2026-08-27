import Link from 'next/link';

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
  featured,
}: ArticleCardProps) {
  const Wrapper = href ? Link : 'div';
  const wrapperProps = href ? { href } : {};

  return (
    <Wrapper
      {...(wrapperProps as any)}
      className={`group block rounded-xl border border-border bg-surface p-6 transition-all hover:shadow-lg hover:shadow-nexus-500/5 ${
        featured ? 'border-l-4 border-l-nexus-500' : ''
      } ${href ? 'cursor-pointer' : ''}`}
    >
      <div className="mb-3">
        <span className="inline-block rounded-full bg-nexus-500/10 px-3 py-1 text-xs font-medium text-nexus-500">
          {category}
        </span>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-foreground group-hover:text-nexus-500 transition-colors">
        {title}
      </h3>
      <p className="mb-4 line-clamp-2 text-sm text-muted">{excerpt}</p>
      <div className="flex items-center gap-3 text-xs text-muted">
        <span>{date}</span>
        <span>·</span>
        <span>{readTime}</span>
      </div>
    </Wrapper>
  );
}
