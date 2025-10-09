import Link from 'next/link';
import { Zap, Target, BarChart3 } from 'lucide-react';

const Home = (): React.ReactElement => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24">
      <div className="tb-container text-center">
        <h1 className="h1 mb-4">
          Content Generator
        </h1>
        <p className="text-xl mb-2">
          AI-Powered Content Generation Platform
        </p>
        <p className="text-lg subtle mb-6 md:mb-12">
          Create compelling content with artificial intelligence
        </p>

        <div className="flex flex-wrap justify-center gap-4 mb-8 md:mb-16">
          <Link
            href="/dashboard"
            className="tb-btn primary"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/generate"
            className="tb-btn"
          >
            Start Generating
          </Link>
        </div>

        <div className="tb-grid cols-3 mt-12">
          <div className="tb-card pad">
            <div className="flex justify-center mb-3">
              <Zap className="w-10 h-10" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="h2 mb-2" style={{ fontSize: '1.125rem' }}>
              Fast Generation
            </h3>
            <p className="text-sm subtle">
              Generate high-quality content in seconds with AI assistance
            </p>
          </div>

          <div className="tb-card pad">
            <div className="flex justify-center mb-3">
              <Target className="w-10 h-10" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="h2 mb-2" style={{ fontSize: '1.125rem' }}>
              Multi-Channel
            </h3>
            <p className="text-sm subtle">
              Create content for email, social media, web, and more
            </p>
          </div>

          <div className="tb-card pad">
            <div className="flex justify-center mb-3">
              <BarChart3 className="w-10 h-10" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="h2 mb-2" style={{ fontSize: '1.125rem' }}>
              Real-Time Monitoring
            </h3>
            <p className="text-sm subtle">
              Track jobs, monitor health, and manage your content pipeline
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm subtle">
          <p>
            Backend API:{' '}
            <code className="tb-chip">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
