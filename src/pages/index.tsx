import { FC } from 'react';
import { MainLayout } from '../components/layout/main-layout';

const IndexPage: FC = () => {
  return (
    <MainLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="max-w-2xl w-full text-center space-y-8">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
            Welcome to Your Project
          </h1>
          <p className="text-xl text-gray-600">
            This is the starting point to create something amazing.
            Customize this page according to your needs.
          </p>
          <div className="flex justify-center gap-4">
            <a
              href="https://sbc-cursor-starter-kit.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get Started
            </a>
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default IndexPage;
