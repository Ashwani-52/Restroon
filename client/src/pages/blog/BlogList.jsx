import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getBlogs } from '../../services/api';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';

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
      <div className="min-h-screen pt-32 pb-20 flex justify-center bg-[#FFFBEF]">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFBEF] pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6"
          >
            The Restroon <span className="text-orange-600">Blog</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 font-medium"
          >
            Insights, food guides, and tips for local cafes.
          </motion.p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center py-20 text-gray-500 text-lg border-2 border-dashed border-gray-300 rounded-3xl">
            No articles found. Come back soon!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, idx) => (
              <motion.div 
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-3xl shadow-xl overflow-hidden hover:-translate-y-2 hover:shadow-orange-200/50 transition-all duration-300 flex flex-col"
              >
                <div className="h-56 overflow-hidden relative group">
                  <img 
                    src={blog.featuredImage} 
                    alt={blog.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/40 to-transparent"></div>
                </div>
                
                <div className="p-8 flex-1 flex flex-col">
                  <div className="flex items-center space-x-4 text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                    <span className="flex items-center"><Calendar size={14} className="mr-1"/> {new Date(blog.createdAt).toLocaleDateString()}</span>
                    <span className="flex items-center"><User size={14} className="mr-1"/> {blog.author}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight">
                    {blog.title}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3">
                    {blog.excerpt}
                  </p>
                  
                  <div className="mt-auto">
                    <Link 
                      to={`/blog/${blog.slug}`} 
                      className="inline-flex items-center font-bold text-orange-600 hover:text-orange-700 transition-colors"
                    >
                      Read Article <ArrowRight size={18} className="ml-2" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default BlogList;
