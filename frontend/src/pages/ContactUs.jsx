import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { CardContent, Card } from "../components/ui/card"
import { Link } from "react-router-dom"
import { Phone, Mail, MapPin, Facebook, Twitter, Linkedin } from "lucide-react"
import { ColorfulLogo } from "../components/custom/Navigations/VerticalNav";
import { useNavigate } from 'react-router-dom';

export default function ContactPage() {
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
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contact Us</h1>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  We're here to help. Get in touch with us for any inquiries or support.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="grid gap-10 px-10 md:gap-16 lg:grid-cols-2">
            <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Contact Information</h2>
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <Phone className="h-6 w-6 text-blue-600" />
                        <span>+1 (555) 123-4567</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Mail className="h-6 w-6 text-blue-600" />
                        <span>support@thehospital.com</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <MapPin className="h-6 w-6 text-blue-600" />
                        <span>123 Healthcare Ave, Medical City, MC 12345</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Follow Us</h3>
                  <div className="flex space-x-4">
                    <Link href="#" className="text-gray-500 hover:text-blue-600">
                      <Facebook className="h-6 w-6" />
                      <span className="sr-only">Facebook</span>
                    </Link>
                    <Link href="#" className="text-gray-500 hover:text-blue-600">
                      <Twitter className="h-6 w-6" />
                      <span className="sr-only">Twitter</span>
                    </Link>
                    <Link href="#" className="text-gray-500 hover:text-blue-600">
                      <Linkedin className="h-6 w-6" />
                      <span className="sr-only">LinkedIn</span>
                    </Link>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Get in Touch</h2>
                <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Fill out the form below and we'll get back to you as soon as possible.
                </p>
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Name
                    </label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email
                    </label>
                    <Input
                      id="email"
                      placeholder="Enter your email"
                      required
                      type="email"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="message" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Enter your message"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
                    Send Message
                  </Button>
                </form>
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