import Link from 'next/link';
import { Zap, Target, BarChart3 } from 'lucide-react';

const Home = (): React.ReactElement => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-4">
          Content Generator
        </h1>
        <p className="text-xl text-gray-700 mb-2">
          AI-Powered Content Generation Platform
        </p>
        <p className="text-lg text-gray-600 mb-12">
          Create compelling content with artificial intelligence
        </p>

        <div className="flex justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-lg transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/generate"
            className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-50 font-semibold shadow-lg transition-colors border border-blue-600"
          >
            Start Generating
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-3">
              <Zap className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Fast Generation
            </h3>
            <p className="text-sm text-gray-600">
              Generate high-quality content in seconds with AI assistance
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-3">
              <Target className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Multi-Channel
            </h3>
            <p className="text-sm text-gray-600">
              Create content for email, social media, web, and more
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-center mb-3">
              <BarChart3 className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Real-Time Monitoring
            </h3>
            <p className="text-sm text-gray-600">
              Track jobs, monitor health, and manage your content pipeline
            </p>
          </div>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>
            Backend API:{' '}
            <code className="bg-gray-200 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}
            </code>
          </p>
        </div>
      </div>
    </main>
  );
};

export default Home;
