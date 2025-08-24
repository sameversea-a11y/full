import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, FileText, Truck } from "lucide-react";

export default function Shipping() {
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
                <Truck className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-3xl">
                Shipping / Delivery Policy
              </CardTitle>
              <CardDescription>
                Digital document delivery process
              </CardDescription>
            </CardHeader>
            <CardContent className="prose prose-gray max-w-none">
              <div className="space-y-8">
                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Overview
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    As udin.in is a digital platform, no physical delivery is
                    involved. All our services are delivered electronically
                    through our secure platform.
                  </p>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Service Delivery
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>
                      Uploaded documents are verified and signed digitally
                    </li>
                    <li>
                      Final signed documents are delivered in PDF format through
                      the user dashboard
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Turnaround Time
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Standard documents: 24–72 hours</li>
                    <li>Complex/manual jobs: up to 7 business days</li>
                    <li>
                      Any delays beyond timelines will be notified to the user
                      via email/SMS
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Tracking & Communication
                  </h2>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Each job gets a unique work ID</li>
                    <li>
                      Users can track real-time progress: Uploaded → Verified →
                      Signed → Downloadable
                    </li>
                    <li>
                      Status notifications are sent by SMS, email, and dashboard
                      alerts
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Document Access
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Download Availability
                      </h3>
                      <p className="text-gray-700 leading-relaxed">
                        Once your documents are processed and signed, they will
                        be available for download from your user dashboard.
                        Documents remain accessible for a minimum of 12 months
                        from the completion date.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Security Features
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>
                          All documents are encrypted during storage and
                          transmission
                        </li>
                        <li>Secure login required to access your documents</li>
                        <li>
                          Digital signatures are tamper-evident and verifiable
                        </li>
                        <li>Download logs are maintained for audit purposes</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Delivery Confirmation
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    You will receive delivery confirmation through multiple
                    channels:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Email notification with download instructions</li>
                    <li>SMS alert to your registered mobile number</li>
                    <li>Dashboard notification when you log in</li>
                    <li>
                      Push notifications if you have our mobile app installed
                    </li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Technical Requirements
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        For Document Download
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>Modern web browser with JavaScript enabled</li>
                        <li>Stable internet connection</li>
                        <li>
                          PDF reader software (Adobe Reader, browser PDF viewer,
                          etc.)
                        </li>
                        <li>Sufficient storage space on your device</li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Supported File Formats
                      </h3>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        <li>PDF documents (primary format)</li>
                        <li>Digitally signed PDFs with UDIN</li>
                        <li>Certificate files where applicable</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Delivery Issues
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you experience any issues with document delivery:
                  </p>
                  <ul className="list-disc list-inside text-gray-700 space-y-2">
                    <li>Check your spam/junk email folder for notifications</li>
                    <li>
                      Verify your contact information is correct in your profile
                    </li>
                    <li>Ensure your internet connection is stable</li>
                    <li>
                      Try accessing your dashboard from a different browser
                    </li>
                    <li>Contact our support team if issues persist</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    Contact Information
                  </h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For delivery-related inquiries or support:
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
