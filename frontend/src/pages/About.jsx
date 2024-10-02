import { Button } from "../components/ui/button"
import { Link } from "react-router-dom"
import { Users, Lightbulb, Target, Mail } from "lucide-react"
import { ColorfulLogo } from "../components/custom/Navigations/VerticalNav";
import { useNavigate } from 'react-router-dom';

export default function AboutPage() {
  const navigate = useNavigate();

  const handleFeaturesClick = (e) => {
    e.preventDefault();
    navigate('/', { state: { scrollToFeatures: true } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="px-4 lg:px-6 h-16 flex items-center bg-white shadow-sm">
        <Link className="flex items-center justify-center" to="/">
          <ColorfulLogo className="h-7 w-7 text-blue-600" />
          <span className="ml-2 text-2xl font-bold text-gray-900">The Hospital</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/">
            Home
          </Link>
          <a 
            href="/#features" 
            className="text-sm font-medium hover:underline underline-offset-4"
            onClick={handleFeaturesClick}
          >
            Features
          </a>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/about">
            About
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" to="/contact">
            Contact
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">About The Hospital</h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Revolutionizing healthcare management with cutting-edge software solutions.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Mission</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  At The Hospital, we are committed to transforming healthcare management through innovative technology. Our
                  mission is to empower healthcare providers with efficient, user-friendly software solutions that streamline
                  operations, enhance patient care, and optimize resource management.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Our Vision</h2>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We envision a future where healthcare institutions worldwide leverage our cutting-edge software to deliver
                  exceptional patient experiences, achieve operational excellence, and drive continuous improvement in
                  healthcare delivery.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Our Core Values</h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center space-y-4">
                <Users className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Patient-Centric Approach</h3>
                <p className="text-gray-500">
                  We prioritize the needs of patients and healthcare providers in every feature we develop.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <Lightbulb className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Innovation</h3>
                <p className="text-gray-500">
                  We continuously push the boundaries of technology to bring cutting-edge solutions to healthcare management.
                </p>
              </div>
              <div className="flex flex-col items-center text-center space-y-4">
                <Target className="h-12 w-12 text-blue-600" />
                <h3 className="text-xl font-bold">Excellence</h3>
                <p className="text-gray-500">
                  We strive for excellence in every aspect of our software, from functionality to user experience.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Our Team</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Behind The Hospital is a dedicated team of healthcare professionals, software engineers, and industry
                  experts committed to revolutionizing hospital management.
                </p>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <Button className="w-full bg-blue-600 text-white hover:bg-blue-700">
                  <Mail className="mr-2 h-4 w-4" /> Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-white">
        <p className="text-xs text-gray-500">© 2024 The Hospital. All rights reserved.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Terms of Service
          </Link>
          <Link className="text-xs hover:underline underline-offset-4" href="#">
            Privacy
          </Link>
        </nav>
      </footer>
    </div>
  )
}