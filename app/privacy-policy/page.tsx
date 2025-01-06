import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString()}</p>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Overview</h2>
            <p>
              Coffee Chat AI is committed to protecting your privacy. This Privacy Policy explains how we handle information when you use our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Don't Store</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>We do not store the bios or URLs you input</li>
              <li>We do not store the questions generated</li>
              <li>We do not store conversation history</li>
              <li>We do not track your usage patterns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Information We Do Store</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Basic account information (email and name) for authentication purposes</li>
              <li>Usage count for free tier limitations</li>
              <li>Payment information is handled securely by Stripe</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Authentication is handled by Google OAuth</li>
              <li>Payments are processed by Stripe</li>
              <li>Website content extraction is handled by Firecrawl</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:wilsonlimset@gmail.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              wilsonlimset@gmail.com
              </a>
            </p>
          </section>

          <div className="mt-8 text-center">
            <Link 
              href="/" 
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 