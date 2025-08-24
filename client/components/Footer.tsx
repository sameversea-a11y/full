import React from "react";
import { FileText } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t bg-white/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-lg font-bold text-gray-900">UDIN</span>
              </div>
              <p className="text-sm text-gray-600">
                Professional document verification and UDIN services by
                qualified chartered accountants.
              </p>
              <div className="text-sm text-gray-600">
                <p>
                  <strong>DialMyCA Private Limited</strong>
                </p>
                <p>Email: info@udin.in</p>
                <p>Phone: +91-9836777722</p>
              </div>
            </div>

            {/* Services */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Services
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Statutory Audit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Tax Audit
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Balance Sheet
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    ROC Services
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    UDIN Generation
                  </a>
                </li>
              </ul>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Quick Links
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/login"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Login
                  </a>
                </li>
                <li>
                  <a
                    href="/signup"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Sign Up
                  </a>
                </li>
                <li>
                  <a
                    href="/dashboard"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Dashboard
                  </a>
                </li>
                <li>
                  <a
                    href="/"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Upload Documents
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/terms"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Terms & Conditions
                  </a>
                </li>
                <li>
                  <a
                    href="/privacy"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/pricing"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Pricing Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/shipping"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Delivery Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/cancellation"
                    className="text-gray-600 hover:text-primary transition-colors"
                  >
                    Cancellation & Refund
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <p className="text-sm text-gray-600">
                © {new Date().getFullYear()} DialMyCA Private Limited. All
                rights reserved.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Jurisdiction: Kolkata, West Bengal</span>
                <span>•</span>
                <span>Governed by Laws of India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
