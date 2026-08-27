'use client';

import { useState } from 'react';
import Link from 'next/link';
import ArticleCard from './components/ArticleCard';
import { IconSearch, IconArrowRight } from './components/Icons';

const CATEGORIES = [
  'All',
  'Teamwork',
  'Analytics',
  'Security',
  'Engineering',
  'Design',
  'Contributing',
];

const FEATURED = {
  title: 'Share Your Insights',
  excerpt:
    'Contribute to our knowledge base by sharing documents and resources directly with your colleagues through a secure peer-to-peer connection.',
  category: 'Contributing',
  date: 'Aug 20, 2026',
  readTime: '2 min read',
  href: '/share',
};

const ARTICLES = [
  {
    title: 'Best Practices for Cross-Team Collaboration',
    excerpt:
      'Discover proven strategies for improving communication and workflow efficiency across distributed teams in a hybrid environment.',
    category: 'Teamwork',
    date: 'Aug 25, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Understanding Data-Driven Decision Making',
    excerpt:
      'How to leverage analytics and metrics to guide strategic choices and measure the impact of your initiatives.',
    category: 'Analytics',
    date: 'Aug 22, 2026',
    readTime: '8 min read',
  },
  {
    title: 'Building Scalable API Architectures',
    excerpt:
      'A deep dive into RESTful design patterns, versioning strategies, and rate limiting approaches for internal services.',
    category: 'Engineering',
    date: 'Aug 24, 2026',
    readTime: '7 min read',
  },
  {
    title: 'Security Best Practices for Internal Tools',
    excerpt:
      'Essential security guidelines for building and maintaining internal applications, from authentication to data handling.',
    category: 'Security',
    date: 'Aug 18, 2026',
    readTime: '6 min read',
  },
  {
    title: 'Effective Onboarding Documentation',
    excerpt:
      'Creating documentation that new team members actually read — templates, structure, and maintenance strategies that work.',
    category: 'Teamwork',
    date: 'Aug 17, 2026',
    readTime: '4 min read',
  },
  {
    title: 'Introduction to Design Systems',
    excerpt:
      'Building a cohesive visual language across products — tokens, components, patterns, and the governance model to sustain them.',
    category: 'Design',
    date: 'Aug 15, 2026',
    readTime: '10 min read',
  },
  {
    title: 'Monitoring and Observability Primer',
    excerpt:
      'From logs to traces to metrics — setting up a comprehensive observability stack that helps you debug issues in production.',
    category: 'Engineering',
    date: 'Aug 12, 2026',
    readTime: '6 min read',
  },
];

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredArticles =
    activeCategory === 'All'
      ? ARTICLES
      : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div>
      {/* Hero */}
      <div className="-mx-4 -mt-6 mb-8 bg-surface-alt px-4 py-16 sm:-mx-6 sm:-mt-8 sm:px-6 sm:py-20 lg:-mx-8 lg:-mt-12 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Your Team&apos;s{' '}
            <span className="bg-gradient-to-r from-nexus-400 to-nexus-600 bg-clip-text text-transparent">
              Knowledge
            </span>{' '}
            Hub
          </h1>
          <p className="mb-8 text-lg text-muted sm:text-xl">
            Explore curated insights, best practices, and resources shared by
            your team.
          </p>

          {/* Decorative search bar */}
          <div className="mx-auto flex max-w-lg items-center gap-3 rounded-full border border-border bg-background px-5 py-3 shadow-sm">
            <IconSearch size={18} className="text-muted" />
            <span className="text-sm text-muted">
              Search articles, guides, and resources...
            </span>
          </div>
        </div>
      </div>

      {/* Featured card */}
      <div className="mb-8">
        <Link
          href={FEATURED.href}
          className="group flex flex-col gap-4 rounded-xl border border-border border-l-4 border-l-nexus-500 bg-surface p-6 transition-all hover:border-nexus-500/40 hover:shadow-lg hover:shadow-nexus-500/5 sm:flex-row sm:items-center sm:p-8"
        >
          <div className="flex-1">
            <span className="mb-2 inline-block rounded-full bg-nexus-500/10 px-3 py-1 text-xs font-medium text-nexus-500">
              {FEATURED.category}
            </span>
            <h2 className="mb-2 text-xl font-bold text-foreground transition-colors group-hover:text-nexus-500 sm:text-2xl">
              {FEATURED.title}
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              {FEATURED.excerpt}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-nexus-500">
            Start sharing
            <IconArrowRight size={16} />
          </div>
        </Link>
      </div>

      {/* Category chips */}
      <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-nexus-500 text-white'
                : 'bg-surface text-muted hover:bg-surface-hover hover:text-foreground'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Section header */}
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          Latest Articles
        </h2>
        <a
          href="#"
          className="flex items-center gap-1 text-sm text-nexus-500 transition-colors hover:text-nexus-600"
        >
          View all <IconArrowRight size={14} />
        </a>
      </div>

      {/* Article grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <ArticleCard key={article.title} {...article} />
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted">
            No articles in this category yet. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
