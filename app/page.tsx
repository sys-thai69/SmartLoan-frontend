import Link from 'next/link';
import {
  ArrowRight,
  Shield,
  Zap,
  Users,
  Sparkles,
  CheckCircle,
  Wallet,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">W</span>
              </div>
              <span className="font-bold text-2xl text-gray-900">SmartLoan</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" />
            Powered by Wing Bank Cambodia
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Never Forget a Loan.
            <br />
            <span className="text-blue-600">Never Lose a Friend.</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            SmartLoan digitalizes informal cash lending between friends, family,
            and colleagues. Create shared records both parties agree to - no
            more disputes, no more broken relationships.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30"
            >
              Start Lending
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-700 rounded-xl font-semibold text-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Manage Loans
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Built specifically for the way Cambodians lend money to each other
              - informal, trust-based, and relationship-focused.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Quick Lend
              </h3>
              <p className="text-gray-600">
                Create a loan in seconds with natural language. Just type &quot;lend
                Channy $50&quot; and our AI handles the rest.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
              <div className="w-12 h-12 rounded-xl bg-green-600 flex items-center justify-center mb-4">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Auto-Debit Payments
              </h3>
              <p className="text-gray-600">
                Link your Wing wallet for automatic payments on due dates. No
                more awkward reminders needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
              <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Wing Advisor
              </h3>
              <p className="text-gray-600">
                Get help drafting follow-up messages, understanding loan terms
                in Khmer, and insights on spending patterns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
              <div className="w-12 h-12 rounded-xl bg-orange-600 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Trust Score
              </h3>
              <p className="text-gray-600">
                Build your reputation as a reliable borrower. Your trust score
                reflects your payment history.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200">
              <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Shared Records
              </h3>
              <p className="text-gray-600">
                Both lender and borrower see the same loan details. Export
                records as PDF evidence if needed.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200">
              <div className="w-12 h-12 rounded-xl bg-cyan-600 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Loan Templates
              </h3>
              <p className="text-gray-600">
                Save your common loan settings as templates. Perfect for
                recurring situations like hangout loans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Simplify Your Lending?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of Cambodians who trust SmartLoan to manage their
            informal loans.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Create Free Account
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl text-white">SmartLoan</span>
            </div>
            <p className="text-sm">
              &copy; {new Date().getFullYear()} SmartLoan. A Wing Bank Cambodia
              Final Project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
