/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, CreditCard, PieChart, Users } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate checking authentication status
  // In a real app, this would check a token in localStorage or cookies
  useEffect(() => {
    const checkAuth = () => {
      const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
      
      if (isAuthenticated) {
        router.push("/dashboard");
      } else {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [router]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1cc29f]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Split expenses with friends and family{" "}
                <span className="text-[#1cc29f]">effortlessly</span>
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Track bills, split expenses, and settle up with friends and family. 
                Perfect for roommates, trips, groups, couples, and more.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" className="btn-primary text-center">
                  Sign up for free
                </Link>
                <Link href="/login" className="btn-secondary text-center">
                  Log in
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <Image 
                src="/images/hero-image.svg" 
                alt="Split expenses with friends" 
                className="w-full h-auto"
                onError={(e) => {
                  e.currentTarget.src = "https://placehold.co/600x400/e4f9f5/1cc29f?text=Split+expenses+with+friends";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-[#e4f9f5] rounded-full flex items-center justify-center mb-4">
                <Users className="text-[#1cc29f]" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Create groups</h3>
              <p className="text-gray-600">
                Create groups for roommates, trips, couples, or any shared expense. Add members easily.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-[#e4f9f5] rounded-full flex items-center justify-center mb-4">
                <CreditCard className="text-[#1cc29f]" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Track expenses</h3>
              <p className="text-gray-600">
                Add expenses as they happen. Split them equally or with custom amounts.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md">
              <div className="w-12 h-12 bg-[#e4f9f5] rounded-full flex items-center justify-center mb-4">
                <PieChart className="text-[#1cc29f]" size={24} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Settle up</h3>
              <p className="text-gray-600">
                See balances at a glance. Settle up with a tap and keep track of who paid.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">What people are saying</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#1cc29f] flex items-center justify-center text-white font-bold">
                  A
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Alex Johnson</h4>
                  <p className="text-sm text-gray-500">Roommate</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;This app has made sharing apartment expenses so much easier. No more awkward money conversations!&quot;
              </p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#8357e6] flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Sarah Miller</h4>
                  <p className="text-sm text-gray-500">Travel Enthusiast</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;Perfect for our group trips! We can all add expenses as we go and settle up at the end.&quot;
              </p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-[#ff5252] flex items-center justify-center text-white font-bold">
                  R
                </div>
                <div className="ml-3">
                  <h4 className="font-semibold">Ryan Patel</h4>
                  <p className="text-sm text-gray-500">Couple</p>
                </div>
              </div>
              <p className="text-gray-600">
                &quot;My partner and I use this for all our shared expenses. It&apos;s simplified our finances completely.&quot;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-[#e4f9f5] px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to start splitting expenses?</h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of people who use our app to track and split expenses with friends and family.
          </p>
          <Link 
            href="/signup" 
            className="btn-primary inline-flex items-center"
          >
            Get started for free
            <ArrowRight size={16} className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-10 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <Link href="/" className="flex items-center">
                <span className="text-[#1cc29f] font-bold text-xl">Split</span>
                <span className="font-bold text-xl">Wise</span>
                <span className="text-[#1cc29f] font-bold text-xl">Clone</span>
              </Link>
            </div>
            <div className="flex space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-gray-900">About</Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-gray-900">Privacy</Link>
              <Link href="/terms" className="text-gray-600 hover:text-gray-900">Terms</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} SplitwiseClone. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
