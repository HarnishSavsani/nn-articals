import ArticleCard from './components/ArticleCard';

const ARTICLES = [
  {
    title: 'Best Practices for Cross-Team Collaboration',
    excerpt:
      'Discover proven strategies for improving communication and workflow efficiency across distributed teams.',
    category: 'Teamwork',
    date: 'Aug 25, 2026',
    readTime: '5 min read',
  },
  {
    title: 'Understanding Data-Driven Decision Making',
    excerpt:
      'How to leverage analytics and metrics to guide strategic choices in your organization.',
    category: 'Analytics',
    date: 'Aug 22, 2026',
    readTime: '8 min read',
  },
  {
    title: 'Share Your Insights',
    excerpt:
      'Contribute to our knowledge base by sharing documents and resources with your colleagues.',
    category: 'Contributing',
    date: 'Aug 20, 2026',
    readTime: '2 min read',
    href: '/share',
    featured: true,
  },
  {
    title: 'Security Best Practices for Internal Tools',
    excerpt:
      'Essential security guidelines for building and maintaining internal applications.',
    category: 'Security',
    date: 'Aug 18, 2026',
    readTime: '6 min read',
  },
];

export default function Home() {
  return (
    <div>
      <div className="mb-10">
        <h1 className="mb-2 text-3xl font-bold text-foreground">
          Welcome to the Knowledge Base
        </h1>
        <p className="text-lg text-muted">
          Explore the latest insights from our team
        </p>
      </div>

      <section>
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          Featured Articles
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {ARTICLES.map((article) => (
            <ArticleCard key={article.title} {...article} />
          ))}
        </div>
      </section>
    </div>
  );
}
