import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, IndianRupee } from "lucide-react";

export default function Pricing() {
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
                <IndianRupee className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">Pricing Policy</CardTitle>
              <CardDescription>
                Transparent pricing for all our services
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    At udin.in, we ensure complete transparency in pricing. Our
                    pricing model is structured to suit multiple document types
                    and compliance requirements.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Scope
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Prices are quoted in Indian Rupees (INR)</li>
                    <li>Applicable GST will be added wherever required</li>
                    <li>
                      All service charges are listed clearly on the website
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Service Charges
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Our pricing covers the following service categories:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Statutory Audit (turnover slabs)</li>
                    <li>Tax Audit</li>
                    <li>Balance Sheet (final & provisional)</li>
                    <li>Auditor Appointment, ROC, Certificates, etc.</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Payment Terms
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>100% advance payment is required for all services</li>
                    <li>
                      Payments are processed through Razorpay or other
                      RBI-approved payment gateways
                    </li>
                    <li>
                      No hidden charges—if any additional charges apply, they
                      are disclosed before checkout
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Pricing Revision
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Prices may be revised from time to time without prior
                      notice
                    </li>
                    <li>Revised pricing does not affect already-paid jobs</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For pricing inquiries or clarifications, please contact us:
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
