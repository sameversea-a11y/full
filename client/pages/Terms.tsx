import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Scale } from "lucide-react";

export default function Terms() {
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
                <Scale className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Terms of Use</CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Acceptance
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    By using udin.in, you agree to abide by these terms. If you
                    do not agree, please discontinue use.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    User Obligations
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Provide genuine documents. Fake or fraudulent submissions
                      will lead to termination and legal action.
                    </li>
                    <li>Maintain confidentiality of your login credentials.</li>
                    <li>Ensure timely payment to avoid delays in services.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Scope of Services
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      UDIN.in acts as a facilitator of document verification and
                      signing.
                    </li>
                    <li>
                      Responsibility is limited to delivering verified and
                      digitally signed files.
                    </li>
                    <li>
                      We do not represent or guarantee acceptance of documents
                      by external authorities/regulators.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Payment Terms
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Payments are non-transferable.</li>
                    <li>
                      Refunds, if applicable, are subject to the Refund Policy.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Limitation of Liability
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      UDIN.in shall not be liable for indirect, incidental, or
                      consequential damages.
                    </li>
                    <li>
                      Our maximum liability is limited to the amount paid for
                      the disputed service.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Prohibited Activities
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Uploading malicious, offensive, or fraudulent content.
                    </li>
                    <li>
                      Attempting to hack, reverse-engineer, or misuse the
                      platform.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Governing Law & Jurisdiction
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Governed by the laws of India.</li>
                    <li>
                      Jurisdiction lies with courts in Kolkata, West Bengal.
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have questions about these Terms of Use, please
                    contact us:
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
