import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a blog title'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  excerpt: {
    type: String,
    required: [true, 'Please provide an excerpt'],
  },
  content: {
    type: String,
    required: [true, 'Please provide blog content (HTML or MD)'],
  },
  featuredImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&w=800&q=80' // default warm cafe pic
  },
  author: {
    type: String,
    default: 'Restroon Team'
  },
  views: {
    type: Number,
    default: 0
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.model('Blog', BlogSchema);
