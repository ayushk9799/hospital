import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ColorfulLogo } from "../components/custom/Navigations/VerticalNav";
import { Menu } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "../components/ui/sheet";

export default function TermsPage() {
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleNavLinkClick = (e, action) => {
    e.preventDefault();
    closeDrawer();
    if (action === 'scrollToFeatures') {
      setTimeout(() => {
        navigate('/', { state: { scrollToFeatures: true } });
      }, 300);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-2 lg:px-6 h-16 flex items-center justify-between bg-white shadow-sm">
        <div className="flex items-center">
          <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden mr-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <nav className="flex flex-col gap-4 mt-4">
                <Link
                  className="text-sm font-medium hover:underline underline-offset-4"
                  to="/"
                  onClick={closeDrawer}
                >
                  Home
                </Link>
                <a
                  href="#features"
                  className="text-sm font-medium hover:underline underline-offset-4 cursor-pointer"
                  onClick={(e) => handleNavLinkClick(e, 'scrollToFeatures')}
                >
                  Features
                </a>
                <Link
                  className="text-sm font-medium hover:underline underline-offset-4"
                  to="/about"
                  onClick={closeDrawer}
                >
                  About
                </Link>
                <Link
                  className="text-sm font-medium hover:underline underline-offset-4"
                  to="/contact"
                  onClick={closeDrawer}
                >
                  Contact
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link className="flex items-center justify-center" to="/">
            <ColorfulLogo className="h-6 w-6 sm:h-7 sm:w-7 text-blue-600" />
            <span className="ml-2 text-lg sm:text-xl md:text-2xl font-bold text-gray-900">
              The Hospital
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-4">
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/"
          >
            Home
          </Link>
          <a
            href="#features"
            className="text-sm font-medium hover:underline underline-offset-4 cursor-pointer"
            onClick={(e) => handleNavLinkClick(e, 'scrollToFeatures')}
          >
            Features
          </a>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/about"
          >
            About
          </Link>
          <Link
            className="text-sm font-medium hover:underline underline-offset-4"
            to="/contact"
          >
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using The Hospital's services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">2. Service Description</h2>
              <p className="text-gray-600">
                The Hospital provides hospital management and healthcare services, including but not limited to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Patient registration and management</li>
                <li>Medical record keeping</li>
                <li>Appointment scheduling</li>
                <li>Billing and payment processing</li>
                <li>Healthcare provider coordination</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">3. User Responsibilities</h2>
              <p className="text-gray-600">
                Users of our services agree to:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-600">
                <li>Provide accurate and complete information</li>
                <li>Maintain the confidentiality of their account credentials</li>
                <li>Comply with all applicable laws and regulations</li>
                <li>Use the services only for their intended purpose</li>
                <li>Not interfere with or disrupt the services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">4. Payment Terms</h2>
              <p className="text-gray-600">
                Users agree to pay all fees and charges associated with their use of our services according to the fees, charges, and billing terms in effect at the time the service is used.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">5. Limitation of Liability</h2>
              <p className="text-gray-600">
                The Hospital shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">6. Changes to Terms</h2>
              <p className="text-gray-600">
                We reserve the right to modify these terms at any time. We will notify users of any material changes by posting the new Terms of Service on this page.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4">7. Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2 text-gray-600">
                Email: thousandways.help@gmail.com<br />
                Phone: +91 9942000425<br />
                Address: Thousand Ways Private Limited, Dariyapur, Bodh Gaya, Bihar 824237, India
              </p>
            </section>
          </div>
        </div>
      </main>
      <footer className="flex flex-col sm:flex-row justify-between items-center py-6 px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500 mb-2 sm:mb-0">© 2024 TheHospital. All rights reserved.</p>
        <nav className="flex gap-4">
          <Link
            className="text-xs hover:underline underline-offset-4"
            to="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4"
            to="/privacy"
          >
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  );
} 