import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogBySlug } from '../../services/api';

const BlogPost = () => {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await getBlogBySlug(slug);
        setBlog(data.data);
      } catch (err) {
        console.error('Failed to load blog post', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-cream retro-grid">
        <div className="w-16 h-16 border-4 border-ink border-t-red rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-cream retro-grid relative">
        <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />
        <h2 className="text-5xl font-bangers text-ink mb-4 drop-shadow-[2px_2px_0_#fff]">Post Not Found 😲</h2>
        <p className="font-grotesk font-bold text-ink/80 mb-8 text-xl">The article you are looking for does not exist.</p>
        <Link to="/blog" className="px-6 py-3 bg-red text-cream font-bangers text-xl tracking-widest rounded-xl border-3 border-ink shadow-[4px_4px_0_#1A1A1A] hover:translate-y-1 hover:shadow-none transition-all">
          ⬅️ BACK TO BLOG
        </Link>
        <div className="absolute bottom-6 left-0 right-0 h-3 stripe-bg z-10" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-cream retro-grid pt-28 pb-20 px-4 sm:px-6">
      <div className="absolute top-0 left-0 right-0 h-3 stripe-bg z-10" />

      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-8 relative z-10">
        <Link to="/blog" className="inline-block px-4 py-2 bg-yellow text-ink font-bangers text-lg tracking-widest rounded-xl border-3 border-ink shadow-[4px_4px_0_#1A1A1A] hover:translate-y-1 hover:shadow-[2px_2px_0_#1A1A1A] transition-all transform -rotate-1">
          ⬅️ ALL ARTICLES
        </Link>
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl mx-auto bg-white rounded-3xl overflow-hidden border-4 border-ink shadow-[12px_12px_0_#1A1A1A]"
      >
        {/* Header Image */}
        <div className="h-[400px] md:h-[500px] relative border-b-4 border-ink">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" loading="lazy" decoding="async" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bangers text-cream leading-none tracking-wide drop-shadow-[4px_4px_0_#1A1A1A] mb-8 relative z-10">
              {blog.title}
            </h1>
            
            <div className="inline-flex flex-wrap items-center gap-4 text-sm md:text-base font-bold font-mono text-ink bg-yellow px-4 py-2 rounded border-2 border-ink transform rotate-1 shadow-[4px_4px_0_#1A1A1A] relative z-10">
              <span className="flex items-center">✍️ {blog.author}</span>
              <span className="flex items-center">🗓️ {new Date(blog.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center">👁️ {blog.views} Views</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-14 lg:p-16 relative bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIj48L3JlY3Q+CjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNWU1ZTUiPjwvcmVjdD4KPC9zdmc+')]">
          <div 
            className="prose prose-lg md:prose-xl max-w-none text-ink font-grotesk font-medium
              prose-headings:font-bangers prose-headings:text-ink prose-headings:tracking-wide prose-headings:drop-shadow-[1px_1px_0_#fff]
              prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-4xl
              prose-h3:text-3xl
              prose-p:leading-relaxed prose-p:mb-6 prose-p:bg-white/80 prose-p:p-2 prose-p:rounded
              prose-a:text-red prose-a:font-bold prose-a:underline prose-a:decoration-4 hover:prose-a:bg-yellow
              prose-img:rounded-2xl prose-img:border-4 prose-img:border-ink prose-img:shadow-[8px_8px_0_#1A1A1A]"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

      </motion.article>

      {/* ── Stripe Banner Bottom ── */}
      <div className="absolute bottom-6 left-0 right-0 h-3 stripe-bg" />
    </div>
  );
};

export default BlogPost;
