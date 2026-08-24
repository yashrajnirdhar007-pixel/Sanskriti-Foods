import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Contact = () => {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif font-bold text-[#b44b20] mb-4">Contact Us</h1>
        <p className="text-lg text-stone-600">We'd love to hear from you. Get in touch with us!</p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
        <div className="bg-[#fcfaf7] p-8 rounded-xl border border-stone-200">
          <h2 className="text-2xl font-bold text-[#244222] mb-6">Send us a Message</h2>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
              <input type="text" className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-[#244222] focus:border-[#244222] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email Address</label>
              <input type="email" className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-[#244222] focus:border-[#244222] outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-stone-300 rounded-md focus:ring-[#244222] focus:border-[#244222] outline-none"></textarea>
            </div>
            <button type="button" className="w-full bg-[#244222] text-white py-3 rounded-md font-medium hover:bg-[#385e2b] transition-colors">
              Send Message
            </button>
          </form>
        </div>

        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Phone</h3>
              <p className="text-stone-600 mt-1">Mon-Sat from 9am to 6pm.</p>
              <p className="text-[#244222] font-medium mt-1">+91 94224 87272</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-full flex items-center justify-center flex-shrink-0">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Email</h3>
              <p className="text-stone-600 mt-1">Our friendly team is here to help.</p>
              <p className="text-[#b44b20] font-medium mt-1">support@gharghutipickles.com</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-800">Office</h3>
              <p className="text-stone-600 mt-1">Come say hello at our kitchen HQ.</p>
              <p className="text-stone-800 font-medium mt-1">123 Tradition Street, Mumbai, Maharashtra 400001</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
