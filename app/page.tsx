import Link from 'next/link';
import Image from 'next/image';
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
    <div className="min-h-screen mesh-bg">
      {/* Header */}
      <header className="glass-strong sticky top-0 z-50 border-b border-slate-200/50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2.5">
              <Image
                src="/smartloan-logo.png"
                alt="SmartLoan"
                width={269}
                height={245}
                className="h-10 w-auto rounded-xl"
                priority
              />
              <span className="font-bold text-2xl text-slate-900">SmartLoan</span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-slate-600 hover:text-slate-900 font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md shadow-indigo-500/20 hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.97]"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32 relative">
        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-indigo-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />

        <div className="text-center max-w-4xl mx-auto relative animate-fade-in-up">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full text-sm font-semibold mb-8 ring-1 ring-indigo-600/10">
            <Sparkles className="w-4 h-4" />
            Peer-to-Peer Lending Made Easy
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight tracking-tight">
            Never Forget a Loan.
            <br />
            <span className="text-gradient">Never Lose a Friend.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            SmartLoan digitalizes informal cash lending between friends, family,
            and colleagues. Create shared records both parties agree to — no
            more disputes, no more broken relationships.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-2xl font-semibold text-lg hover:from-indigo-700 hover:to-violet-700 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 active:scale-[0.97]"
            >
              Start Lending
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-slate-700 rounded-2xl font-semibold text-lg hover:bg-slate-50 transition-all border border-slate-200 hover:border-slate-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Everything You Need to Manage Loans
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built for helping friends, family, and colleagues manage informal loans
              — transparent, trust-based, and relationship-focused.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {/* Feature 1 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center mb-4 shadow-md shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Quick Lend
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Create a loan in seconds with natural language. Just type &quot;lend
                Channy $50&quot; and our AI handles the rest.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-md shadow-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Auto-Debit Payments
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Enable auto-debit for automatic payments on due dates. No
                more awkward reminders needed.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-violet-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center mb-4 shadow-md shadow-violet-500/20 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                AI Smart Advisor
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Get help drafting follow-up messages, understanding loan terms
                in Khmer, and insights on spending patterns.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-4 shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Trust Score
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Build your reputation as a reliable borrower. Your trust score
                reflects your payment history.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-rose-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 flex items-center justify-center mb-4 shadow-md shadow-rose-500/20 group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Shared Records
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Both lender and borrower see the same loan details. Export
                records as PDF evidence if needed.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/60 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 flex items-center justify-center mb-4 shadow-md shadow-cyan-500/20 group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Loan Templates
              </h3>
              <p className="text-slate-600 leading-relaxed">
                Save your common loan settings as templates. Perfect for
                recurring situations like hangout loans.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 p-12 text-center overflow-hidden">
            {/* Decorative glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
            <div className="relative">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 tracking-tight">
                Ready to Simplify Your Lending?
              </h2>
              <p className="text-xl text-indigo-100 mb-8 max-w-xl mx-auto">
                Join thousands of Cambodians who trust SmartLoan to manage their
                informal loans.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-indigo-600 rounded-2xl font-semibold text-lg hover:bg-indigo-50 transition-all shadow-lg hover:shadow-xl active:scale-[0.97]"
              >
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-bold text-xl text-slate-900">SmartLoan</span>
            </div>
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} SmartLoan. All rights reserved.
              Final Project.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
