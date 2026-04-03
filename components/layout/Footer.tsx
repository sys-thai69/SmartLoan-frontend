import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/60 mt-auto bg-white/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <Image
                src="/Smartloan-logo.PNG"
                alt="SmartLoan"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-bold text-xl text-slate-900">SmartLoan</span>
            </div>
            <p className="text-sm text-slate-500 max-w-md leading-relaxed">
              A peer-to-peer informal loan tracker that helps friends, family, and colleagues manage loans transparently. Digitalize informal cash lending — no more disputes or broken relationships.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/loans"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Loans
                </Link>
              </li>
              <li>
                <Link
                  href="/loans/quick"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Quick Lend
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-slate-900 mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-slate-200/60">
          <p className="text-sm text-slate-400 text-center">
            &copy; {new Date().getFullYear()} SmartLoan. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
