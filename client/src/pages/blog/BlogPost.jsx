import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getBlogBySlug } from '../../services/api';
import { Calendar, User, Eye, ArrowLeft } from 'lucide-react';

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
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-[#FFFBEF]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center bg-[#FFFBEF]">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Post Not Found</h2>
        <p className="text-gray-600 mb-8">The article you are looking for does not exist.</p>
        <Link to="/blog" className="text-orange-600 font-semibold hover:underline flex items-center">
          <ArrowLeft size={16} className="mr-2"/> Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] pt-28 pb-20 px-4 sm:px-6">
      
      {/* Back Button */}
      <div className="max-w-4xl mx-auto mb-8">
        <Link to="/blog" className="inline-flex items-center text-gray-500 hover:text-orange-600 font-medium transition-colors">
          <ArrowLeft size={20} className="mr-2"/> All Articles
        </Link>
      </div>

      <motion.article 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-orange-100"
      >
        {/* Header Image */}
        <div className="h-[400px] md:h-[500px] relative">
          <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent"></div>
          
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-14">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              {blog.title}
            </h1>
            
            <div className="flex flex-wrap items-center space-x-6 text-sm md:text-base font-medium text-orange-50 uppercase tracking-widest">
              <span className="flex items-center"><User size={18} className="mr-2"/> {blog.author}</span>
              <span className="flex items-center"><Calendar size={18} className="mr-2"/> {new Date(blog.createdAt).toLocaleDateString()}</span>
              <span className="flex items-center"><Eye size={18} className="mr-2"/> {blog.views} Views</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 md:p-14 lg:p-16">
          <div 
            className="prose prose-lg md:prose-xl prose-orange max-w-none text-gray-700
              prose-headings:font-bold prose-headings:text-gray-900 
              prose-h2:mt-12 prose-h2:mb-6 prose-h2:text-3xl
              prose-p:leading-relaxed prose-p:mb-6
              prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-3xl prose-img:shadow-xl"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>

      </motion.article>
    </div>
  );
};

export default BlogPost;
