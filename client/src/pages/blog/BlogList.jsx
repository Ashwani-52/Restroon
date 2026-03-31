import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBlogs } from '../../services/api';
import { Link } from 'react-router-dom';
import { ComicText } from '../../components/ui/ComicText';
import { BackButton } from '../../components/ui/BackButton';

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getBlogs();
        setBlogs(data.data || []);
      } catch (err) {
        console.error('Failed to load blogs', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-cream retro-grid">
        <div className="w-16 h-16 border-4 border-ink border-t-red rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cream retro-grid pt-28 pb-20 px-4 sm:px-6">
      {/* ── Stripe Banner Top ── */}
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />

      <BackButton className="top-8 left-8" />

      {/* ── Floating Stars ── */}
      {['⭐', '✨', '💥'].map((star, i) => (
        <motion.div
            key={i}
            className="absolute text-3xl pointer-events-none z-0 hidden md:block"
            style={{
                top: `${15 + i * 25}%`,
                left: i % 2 === 0 ? `${5 + i * 5}%` : undefined,
                right: i % 2 !== 0 ? `${5 + i * 5}%` : undefined,
            }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 2 + i * 0.3, repeat: Infinity, ease: 'easeInOut' }}
        >
            {star}
        </motion.div>
      ))}

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="text-center mb-16 max-w-2xl mx-auto mt-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <ComicText fontSize={5}>THE RESTROON BLOG</ComicText>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl font-grotesk font-bold text-ink bg-white inline-block px-6 py-2 border-3 border-ink shadow-[4px_4px_0_#1A1A1A] rounded-2xl transform rotate-1"
          >
            Insights, food guides, and tips for local cafes.
          </motion.p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 font-bangers text-3xl text-ink bg-white border-3 border-ink shadow-[8px_8px_0_#1A1A1A] rounded-3xl max-w-md mx-auto">
            No articles found. Come back soon! 😢
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {blogs.map((blog, idx) => (
              <motion.div 
                key={blog._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-3xl border-3 border-ink shadow-[8px_8px_0_#1A1A1A] hover:shadow-[12px_12px_0_#1A1A1A] transition-all flex flex-col overflow-hidden"
              >
                <div className="h-60 overflow-hidden relative border-b-3 border-ink">
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  {/* Comic Action Tag overlay */}
                  <div className="absolute top-4 right-4 bg-yellow border-2 border-ink px-3 py-1 rounded-full font-bangers tracking-wider text-sm transform rotate-3 shadow-[2px_2px_0_#1A1A1A]">
                    HOT NOW 🔥
                  </div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNjY2MiPjwvcmVjdD4KPC9zdmc+')]">
                  <div className="flex items-center space-x-4 text-xs font-bold font-mono text-ink/70 mb-4 bg-cream inline-block px-3 py-1 rounded border-2 border-ink">
                    <span>🗓️ {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="mx-2">•</span>
                    <span>✍️ {blog.author}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bangers text-ink mb-4 leading-tight tracking-wide drop-shadow-[1px_1px_0_#fff]">
                    {blog.title}
                  </h2>
                  <p className="font-grotesk font-semibold text-ink/80 mb-8 line-clamp-3 bg-white/80 p-2 rounded">
                    {blog.excerpt}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/blog/${blog.slug}`} 
                      className="block w-full text-center bg-red text-cream py-3 rounded-xl border-3 border-ink shadow-[4px_4px_0_#1A1A1A] font-bangers tracking-widest text-xl transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_#1A1A1A] active:translate-y-0 active:shadow-[2px_2px_0_#1A1A1A]"
                    >
                      READ FULL POST ➡️
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Stripe Banner Bottom ── */}
      <div className="absolute bottom-6 left-0 right-0 h-3 stripe-bg" />
    </div>
  );
};

export default BlogList;
