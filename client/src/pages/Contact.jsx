import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Clock, Send, CheckCircle } from 'lucide-react';
import { submitContact } from '../services/api';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [successStatus, setSuccessStatus] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await submitContact(formData);
      setSuccessStatus('Message sent successfully! Our team will get back to you within 24-48 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEF] pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center mb-4 tracking-tight">
          Get in <span className="text-orange-600">Touch</span>
        </h1>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-16 text-lg">
          Whether you're a cafe owner looking to partner, or a customer with a query—we're here to help. Drop us a line!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
          
          {/* Contact Info Panel */}
          <div className="bg-gradient-to-br from-orange-500 to-orange-400 p-10 text-white relative flex flex-col justify-between">
            <div className="absolute inset-0 bg-white opacity-5 mix-blend-overlay pointer-events-none pattern-dots"></div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <p className="text-orange-50 mb-10 leading-relaxed max-w-sm">
                Fill out the form and our Team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full"><Mail size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">Email Us</p>
                    <p className="text-orange-100 font-medium font-mono tracking-wide">support@restroon.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full"><Clock size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">Response Time</p>
                    <p className="text-orange-100 font-medium">24 – 48 hours (Mon-Fri)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="bg-white/20 p-3 rounded-full"><MapPin size={24} /></div>
                  <div>
                    <p className="font-semibold text-lg">Headquarters</p>
                    <p className="text-orange-100 font-medium">Punjab, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-10 lg:p-14">
            {successStatus ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <CheckCircle size={64} className="text-green-500" />
                <h3 className="text-2xl font-bold text-gray-900">Thank You!</h3>
                <p className="text-gray-600">{successStatus}</p>
                <button onClick={() => setSuccessStatus(null)} className="mt-6 text-orange-600 font-semibold hover:underline">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && <div className="p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200">{errorMsg}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange}
                      autoComplete="name"
                      className="w-full px-5 py-3 rounded-xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-gray-900"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      autoComplete="email"
                      className="w-full px-5 py-3 rounded-xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-gray-900"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Subject</label>
                  <input required name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-gray-900"
                    placeholder="Subject of your inquiry"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange}
                    rows="4"
                    className="w-full px-5 py-3 rounded-xl bg-orange-50/50 border border-orange-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 transition-all font-medium text-gray-900 resize-none"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold flex items-center justify-center space-x-2 transition-transform transform active:scale-[0.98] disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send size={18} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
