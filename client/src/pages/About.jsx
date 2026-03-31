import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Utensils, Percent, HeartHandshake } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-white pt-28 pb-20">
      
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-24">
        <div className="text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8"
          >
            We are <span className="text-orange-600">Restroon</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto font-medium"
          >
            A high-tech restaurant discovery and ordering platform designed to help local cafes thrive without giving away 30% of their revenue.
          </motion.p>
        </div>
      </section>

      {/* Why We Exist */}
      <section className="bg-orange-50/50 py-24 mb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                For too long, local independent cafes have been squeezed by massive delivery aggregators charging exorbitant commissions. Small businesses were forced to raise menu prices, hurting their customers, just to stay afloat.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Restroon was built to change this. We provide the same high-end technology—QR ordering, rapid pickup, direct delivery links—while focusing strictly on transparency and local empowerment.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Percent, title: "Zero Commission", desc: "Restaurants keep 100% of their earnings." },
                { icon: Building2, title: "Local First", desc: "Built specifically to uplift local cafes and stalls." },
                { icon: Utensils, title: "Transparent Menus", desc: "No artificially inflated online prices." },
                { icon: HeartHandshake, title: "Direct Contact", desc: "Customers connect directly with cafes." },
              ].map((val, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-lg border border-orange-100 flex flex-col items-center text-center">
                  <div className="bg-orange-100 text-orange-600 p-4 rounded-full mb-4">
                    <val.icon size={28} />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{val.title}</h3>
                  <p className="text-sm text-gray-600">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Founder & Tech Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-8">The Story Behind Restroon</h2>
        <div className="max-w-3xl mx-auto bg-white p-10 md:p-14 rounded-3xl shadow-xl border border-gray-100">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Restroon was founded in India by <strong>Ashwani Kumar</strong>, who noticed a widening gap between what customers paid online and what restaurants actually earned. 
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-10">
            Powered by modern technologies like <strong>React, Node.js, and MongoDB</strong>, Restroon offers an incredibly fast and resilient platform capable of handling peak mealtime traffic securely. The future vision is to onboard millions of small-scale food vendors, digitizing their menus entirely free of cost.
          </p>
          <div className="inline-flex items-center space-x-2 bg-gray-900 text-white px-6 py-3 rounded-full font-semibold">
            <span>Built with ❤️ in India</span>
          </div>
        </div>
      </section>

    </div>
  );
};

export default About;
