import { FC, PropsWithChildren } from 'react';

export const MainLayout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="text-xl font-bold text-gray-900">
              Your Project
            </a>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900"
            >
              GitHub
            </a>
            <a
              href="https://github.com/m4n3z40/sbc-cursor-starter-kit/blob/main/README.md"
              className="text-gray-600 hover:text-gray-900"
            >
              Documentation
            </a>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="bg-gray-50">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500">
            © {new Date().getFullYear()} Your Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
