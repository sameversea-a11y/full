import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Shield, FileText } from "lucide-react";

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate("/")}
            >
              <FileText className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">UDIN</span>
            </div>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Privacy Policy</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Information We Collect
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Personal Information
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        We collect the following personal information:
                      </p>
                      <ul className="list-disc list-inside text-gray-700 ml-4 mt-2 space-y-1">
                        <li>
                          Personal details: Name, contact number, email, address
                        </li>
                        <li>Uploaded documents for signing</li>
                        <li>
                          Payment details (handled by third-party gateway, not
                          stored by us)
                        </li>
                        <li>
                          Technical data (IP address, browser, device info)
                        </li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    How We Use Your Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We use the collected information for the following purposes:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Verify and authenticate documents</li>
                    <li>Deliver services and provide updates</li>
                    <li>Process payments securely</li>
                    <li>Internal research, audits, and compliance</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Data Protection Measures
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    We implement strong security measures to protect your
                    information:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Encrypted data storage and transfer</li>
                    <li>Access to data restricted to authorized staff only</li>
                    <li>
                      Multi-level authentication for document vault access
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Third-party Sharing
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>We do not sell user data</li>
                    <li>
                      Data may be shared with regulators, government bodies, or
                      courts if required by law
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    User Rights
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Right to access and download stored documents</li>
                    <li>
                      Right to request deletion of personal data (except
                      regulatory records)
                    </li>
                    <li>
                      Right to withdraw consent at any time (services will stop
                      accordingly)
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Cookies Policy
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      We use cookies for analytics, session management, and
                      better UX
                    </li>
                    <li>Users can disable cookies via browser settings</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Website:</strong> www.udin.in
                      <br />
                      <strong>Email:</strong> info@udin.in
                      <br />
                      <strong>Phone:</strong> +91-9836777722
                      <br />
                      <strong>Company:</strong> DialMyCA Private Limited
                    </p>
                  </div>
                </section>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
