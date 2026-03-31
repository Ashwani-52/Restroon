import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { submitContact } from '../services/api';
import { ComicText } from '../components/ui/ComicText';
import { CartoonButton } from '../components/ui/CartoonButton';
import { BackButton } from '../components/ui/BackButton';

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
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };
      await submitContact(payload);
      setSuccessStatus('Message sent successfully! Our team will get back to you within 24 hours.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-cream retro-grid overflow-hidden pt-28 pb-20 px-4 sm:px-6">
      {/* ── Stripe Banner Top ── */}
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />

      <BackButton className="top-8 left-8" />

      {/* ── Floating Elements ── */}
      {['✉️', '🚀', '💬', '📞', '⚡'].map((emoji, i) => (
        <motion.div
            key={i}
            className="absolute text-3xl pointer-events-none z-0 hidden md:block"
            style={{
                top: `${20 + i * 15}%`,
                left: i % 2 === 0 ? `${5 + i * 5}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 5}%` : undefined,
            }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {emoji}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <ComicText fontSize={5}>GET IN TOUCH</ComicText>
        </motion.div>

        <p className="font-grotesk font-bold text-ink text-center max-w-2xl mx-auto mb-16 text-xl">
          Whether you're a cafe owner looking to partner, or a customer with a query—we're here to help. Drop us a line!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl border-3 border-ink shadow-[10px_10px_0_#1A1A1A] overflow-hidden">
          
          {/* Contact Info Panel */}
          <div className="bg-red p-10 text-cream relative flex flex-col justify-between border-b-3 lg:border-b-0 lg:border-r-3 border-ink">
            {/* Halftone dots overlay */}
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #000 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
            <div className="relative z-10">
              <h2 className="font-bangers tracking-wide text-4xl mb-6 drop-shadow-[2px_2px_0_#1A1A1A]">Contact Info</h2>
              <p className="font-grotesk font-semibold mb-10 leading-relaxed max-w-sm text-lg">
                Fill out the form and our Team will get back to you within 24 hours.
              </p>
              
              <div className="space-y-8 font-grotesk">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📧</div>
                  <div>
                    <p className="font-bold text-lg">Email Us</p>
                    <p className="font-medium font-mono text-yellow bg-ink px-2 py-1 rounded inline-block mt-1 border-2 border-ink">ashwanikumar6064@gmail.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">⏰</div>
                  <div>
                    <p className="font-bold text-lg">Response Time</p>
                    <p className="font-medium text-cream bg-ink px-2 py-1 rounded inline-block mt-1 border-2 border-ink">24 – 48 hours (Mon-Fri)</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">📍</div>
                  <div>
                    <p className="font-bold text-lg">Headquarters</p>
                    <p className="font-medium text-cream bg-ink px-2 py-1 rounded inline-block mt-1 border-2 border-ink">Punjab, India</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel */}
          <div className="p-10 lg:p-14 bg-white relative">
            {successStatus ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center text-center space-y-4">
                <div className="text-6xl mb-2">✅</div>
                <h3 className="font-bangers text-4xl text-ink tracking-wide">Awesome!</h3>
                <p className="font-grotesk font-bold text-lg text-ink/80">{successStatus}</p>
                <button onClick={() => setSuccessStatus(null)} className="mt-6 text-orange font-bold font-grotesk underline hover:text-red transition-colors text-lg">
                  Send another message
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && <div className="p-4 bg-red/20 text-red font-bold rounded-xl border-3 border-ink text-sm shadow-[4px_4px_0_#1A1A1A]">{errorMsg}</div>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-lg font-bangers tracking-wide text-ink">Full Name</label>
                    <input required name="name" value={formData.name} onChange={handleChange}
                      autoComplete="name"
                      className="w-full px-5 py-3 rounded-xl bg-cream border-3 border-ink shadow-[4px_4px_0_#1A1A1A] focus:outline-none focus:translate-y-1 focus:shadow-[2px_2px_0_#1A1A1A] transition-all font-grotesk font-bold text-ink placeholder:text-ink/40"
                      placeholder="Jane Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-lg font-bangers tracking-wide text-ink">Email Address</label>
                    <input required type="email" name="email" value={formData.email} onChange={handleChange}
                      autoComplete="email"
                      className="w-full px-5 py-3 rounded-xl bg-cream border-3 border-ink shadow-[4px_4px_0_#1A1A1A] focus:outline-none focus:translate-y-1 focus:shadow-[2px_2px_0_#1A1A1A] transition-all font-grotesk font-bold text-ink placeholder:text-ink/40"
                      placeholder="jane@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-bangers tracking-wide text-ink">Subject</label>
                  <input required name="subject" value={formData.subject} onChange={handleChange}
                    className="w-full px-5 py-3 rounded-xl bg-cream border-3 border-ink shadow-[4px_4px_0_#1A1A1A] focus:outline-none focus:translate-y-1 focus:shadow-[2px_2px_0_#1A1A1A] transition-all font-grotesk font-bold text-ink placeholder:text-ink/40"
                    placeholder="Subject of your inquiry"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-lg font-bangers tracking-wide text-ink">Message</label>
                  <textarea required name="message" value={formData.message} onChange={handleChange}
                    rows="4"
                    className="w-full px-5 py-3 rounded-xl bg-cream border-3 border-ink shadow-[4px_4px_0_#1A1A1A] focus:outline-none focus:translate-y-1 focus:shadow-[2px_2px_0_#1A1A1A] transition-all font-grotesk font-bold text-ink resize-none placeholder:text-ink/40"
                    placeholder="How can we help you?"
                  ></textarea>
                </div>

                <div className="pt-4 text-center">
                  <CartoonButton 
                    label={loading ? "SENDING..." : "SEND MESSAGE 🚀"} 
                    type="submit" 
                    disabled={loading}
                    size="lg"
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ── Stripe Banner Bottom ── */}
      <div className="absolute bottom-6 left-0 right-0 h-3 stripe-bg" />
    </div>
  );
};

export default Contact;
