import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, XCircle } from "lucide-react";

export default function Cancellation() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
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
                <XCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">
                Cancellation & Refund Policy
              </CardTitle>
              <CardDescription>
                Last updated: {new Date().toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Cancellation Policy
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Cancellations are allowed only before document
                      verification starts
                    </li>
                    <li>
                      Once verification or signing begins, cancellation is not
                      possible
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Refund Conditions
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Full refund: If service cannot be provided due to
                      internal/system error
                    </li>
                    <li>
                      Partial refund: If only part of the service is delivered
                      (case-by-case)
                    </li>
                    <li>
                      No refund: If user submits wrong/incomplete documents or
                      cancels after processing starts
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Refund Process
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Refund requests must be raised via support@udin.in within
                      7 days of payment
                    </li>
                    <li>
                      Refunds are processed within 7–10 business days to the
                      original payment method
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Exceptions (Non-Refundable)
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Customized/manual services once initiated</li>
                    <li>
                      Cases of misuse, fraud, or breach of terms by the user
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Dispute Resolution
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Users should first approach customer support</li>
                    <li>
                      If unresolved, disputes shall be settled under Indian
                      Arbitration Act, 1996
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For cancellation requests or questions about this policy,
                    please contact us:
                  </p>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <p className="text-gray-700">
                      <strong>Website:</strong> www.udin.in
                      <br />
                      <strong>Email:</strong> info@udin.in
                      <br />
                      <strong>Support:</strong> support@udin.in
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
