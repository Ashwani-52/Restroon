import React from 'react';
import { ShieldAlert, RefreshCcw, Cookie, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const PageLayout = ({ icon: Icon, title, lastUpdated, children }) => (
  <div className="min-h-screen bg-[#FFFBEF] pt-28 pb-20 px-4 sm:px-6">
    <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-flex w-16 h-16 bg-white rounded-2xl items-center justify-center text-orange-500 mb-6 shadow-lg shadow-orange-600/20"
        >
          <Icon size={32} />
        </motion.div>
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
          {title}
        </h1>
        <p className="text-orange-100 uppercase tracking-widest text-sm font-semibold">
          Last Updated: {lastUpdated}
        </p>
      </div>

      <div className="p-8 md:p-12 prose prose-lg prose-orange max-w-none text-gray-700">
        {children}
      </div>
    </div>
  </div>
);

export const Terms = () => (
  <PageLayout icon={ShieldAlert} title="Terms & Conditions" lastUpdated="March 31, 2026">
    <h2>1. Acceptance of Terms</h2>
    <p>By accessing or using the Restroon platform (the "Service"), you agree to be bound by these Terms and Conditions. Restroon allows users to discover local cafes and restaurants, view menus, and place orders directly with partner merchants.</p>

    <h2>2. User Responsibilities</h2>
    <p>Users are responsible for ensuring their account details, delivery address, and contact information are accurate. Any misuse of the platform, including placing fake orders, may result in permanent suspension.</p>

    <h2>3. Restaurant Responsibilities</h2>
    <p>Partner cafes are responsible for maintaining accurate pricing, availability, and fulfilling accepted orders in a timely manner. Restroon acts merely as a technology facilitator and does not prepare or handle food.</p>

    <h2>4. Payment Terms & Zero Commission</h2>
    <p>We pride ourselves on charging minimal or zero commission to our partner restaurants. Payments are securely processed via Razorpay. Users are responsible for all applicable taxes and delivery charges stated at checkout.</p>

    <h2>5. Cancellation & Refunds</h2>
    <p>Orders can only be cancelled before they are accepted by the restaurant. For full details on dispute resolution, please refer to our dedicated <a href="/refund-policy" className="text-orange-600 underline">Refund Policy</a>.</p>

    <h2>6. Platform Liability</h2>
    <p>Restroon is not liable for the quality of food prepared by restaurants, delivery delays due to unforeseen circumstances, or any allergic reactions. We do not guarantee uninterrupted access to the platform.</p>

    <h2>7. Governing Law</h2>
    <p>These terms shall be governed by and constructed in accordance with the laws of India. Any disputes arising out of these terms shall be subject to the exclusive jurisdiction of the courts in India.</p>
  </PageLayout>
);

export const RefundPolicy = () => (
  <PageLayout icon={RefreshCcw} title="Refund Policy" lastUpdated="March 31, 2026">
    <h2>Order Cancellation</h2>
    <p>Orders can be cancelled exclusively before the restaurant accepts the preparation. Once an order is marked as "Accepted" or "Preparing", it cannot be cancelled by the user through the app.</p>

    <h2>Eligibility for Refunds</h2>
    <p>Refunds may be issued under the following circumstances:</p>
    <ul>
      <li>The restaurant rejects or is entirely unable to fulfill your order.</li>
      <li>Wrong items were delivered (subject to verification via photo evidence).</li>
      <li>The food was entirely spoiled or a major spillage occurred during transit.</li>
    </ul>

    <h2>Refund Process</h2>
    <p>If eligible, refunds will be initiated back to the original payment method. Depending on your bank or UPI provider, the amount typically reflects in your account within <strong>5-7 business days</strong>.</p>
  </PageLayout>
);

export const CookiePolicy = () => (
  <PageLayout icon={Cookie} title="Cookie Policy" lastUpdated="March 31, 2026">
    <h2>How We Use Cookies</h2>
    <p>A cookie is a small piece of data sent from a website and stored on the user's computer by the user's web browser. Restroon uses essential cookies to ensure the platform functions properly.</p>

    <h2>Types of Cookies We Use</h2>
    <ul>
      <li><strong>Session Cookies:</strong> Used to maintain your logged-in state securely while browsing the app.</li>
      <li><strong>Performance Cookies:</strong> We utilize Google Analytics (GA4) to understand network traffic, bounce rates, and user interactions anonymously to improve Restroon's speed and design.</li>
    </ul>

    <h2>Managing Your Preferences</h2>
    <p>You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use certain portions of our Service (such as staying logged in).</p>
  </PageLayout>
);

export const FAQ = () => (
  <PageLayout icon={HelpCircle} title="Frequently Asked Questions" lastUpdated="March 31, 2026">
    <h3>1. What is Restroon?</h3>
    <p>Restroon is a modern dining and ordering platform built to support local cafes by offering them a high-tech ordering system without the crippling 30% commission fees charged by traditional delivery apps.</p>

    <h3>2. Are prices on Restroon the same as dining in?</h3>
    <p>Yes! Because we do not charge exorbitant commissions, our partner restaurants do not need to artificially inflate their online menu prices. What you see is the real menu price.</p>

    <h3>3. Can I book a table using Restroon?</h3>
    <p>Currently, you can place orders for pickup, delivery, or dine-in. Some cafes support live table ordering by scanning a QR code directly at your table!</p>

    <h3>4. How do I report an issue with my order?</h3>
    <p>Please reach out via our Contact Page or use the "Report Issue" button on your recent orders page. Our support team responds within 24-48 hours.</p>

    <h3>5. How can I list my Cafe on Restroon?</h3>
    <p>It's entirely free to join. You can click on "Add Your Cafe" at the bottom of the homepage to register and start receiving orders immediately.</p>
  </PageLayout>
);
