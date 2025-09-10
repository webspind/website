import { getClientConfig } from '@/config/env';

export default function Home() {
  const config = getClientConfig();
  
  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {config.siteName}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            PDF Tools & More — fast, private, in-browser tools
          </p>
        </header>

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Credit System Explanation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              How Credits Work
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-green-600 dark:text-green-400 text-sm font-semibold">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Free Daily Credits</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      You get 3 free credits every day
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600 dark:text-blue-400 text-sm">✓</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Processing is Free</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Preview and process files without spending credits
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-orange-600 dark:text-orange-400 text-sm">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">Downloads Cost 1 Credit</h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Download the finished file for 1 credit
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600 dark:text-purple-400 text-sm">$</span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {config.paymentsEnabled ? 'Payments Available' : 'Payments Coming Later'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {config.paymentsEnabled 
                        ? 'Additional credits are available for purchase'
                        : 'Additional credits will be available for purchase soon'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools Preview */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">PDF Tools</h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                <li>• Merge PDFs</li>
                <li>• Split pages</li>
                <li>• Compress files</li>
                <li>• OCR scans</li>
                <li>• Export to images</li>
                <li>• Add watermarks</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Text Tools</h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                <li>• Word counter</li>
                <li>• Case converter</li>
                <li>• AI text detector</li>
                <li>• Text utilities</li>
              </ul>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Privacy First</h3>
              <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                <li>• Local processing</li>
                <li>• No file uploads</li>
                <li>• Browser-based tools</li>
                <li>• Your data stays private</li>
              </ul>
            </div>
          </div>

              {/* Available Tools */}
              <div className="text-center mt-12">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                    ✅ Tools Available Now
                  </h3>
                  <p className="text-green-700 dark:text-green-300 mb-4">
                    Try our PDF tools right now! All processing happens in your browser for maximum privacy.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <a 
                      href="/tools/pdf-merge" 
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Merge PDFs
                    </a>
                    <a 
                      href="/tools/pdf-split" 
                      className="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                    >
                      Split PDFs
                    </a>
                  </div>
                </div>
              </div>
        </main>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500 dark:text-gray-400">
          <p>&copy; 2024 Webspind. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
