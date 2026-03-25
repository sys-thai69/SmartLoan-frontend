import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <span className="font-bold text-xl text-gray-900">SmartLoan</span>
            </div>
            <p className="text-sm text-gray-500 max-w-md">
              A peer-to-peer informal loan tracker built for Wing Bank Cambodia.
              Digitalize informal cash lending between friends, family, and
              colleagues - no more disputes or broken relationships.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/loans"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Loans
                </Link>
              </li>
              <li>
                <Link
                  href="/loans/quick"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Quick Lend
                </Link>
              </li>
              <li>
                <Link
                  href="/wallet"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Wallet
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="#"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} SmartLoan. A Wing Bank Cambodia
            Final Project. Mock payment system for demonstration purposes.
          </p>
        </div>
      </div>
    </footer>
  );
}
