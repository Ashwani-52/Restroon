import Blog from '../models/Blog.model.js';

const defaultBlogs = [
  {
    title: "Top 10 Cafes in Punjab You Must Visit",
    slug: "top-10-cafes-in-punjab",
    excerpt: "Discover the hidden gems and popular spots across Punjab for the best coffee and ambiance.",
    content: "<h2>1. The Hidden Bean, Jalandhar</h2><p>Known for its robust espresso and cozy corners, The Hidden Bean is a favorite among students and remote workers.</p><h2>2. Brew & Books, Ludhiana</h2><p>A paradise for readers. Enjoy a hot cappuccino while surrounded by thousands of books.</p><h2>3. Local Cafe, Chandigarh</h2><p>With a modern aesthetic and vegan-friendly options, this cafe is leading the new wave of coffee culture in the city.</p><p>...and many more. Punjab's cafe scene is booming, with local entrepreneurs bringing global standards to local neighborhoods.</p>",
    featuredImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&w=800&q=80",
    author: "Ashwani Kumar"
  },
  {
    title: "Best Budget Cafes Near LPU",
    slug: "best-budget-cafes-near-lpu",
    excerpt: "A student's guide to great food and coffee without breaking the bank near Lovely Professional University.",
    content: "<h2>Affordable Eats Near Campus</h2><p>Being a student means managing a tight budget. But that doesn't mean you have to compromise on quality food or a good place to hang out. We've compiled a list of the best cafes near LPU where you can get a satisfying meal for under ₹200.</p><h3>The Student Hideout</h3><p>Located just 5 minutes from the main gate, offering combo meals and free Wi-Fi.</p><h3>Chai & More</h3><p>Perfect for evening breaks. Their cutting chai and bun maska are legendary among the hostelers.</p><p>Restroon helps you find more of these budget-friendly spots. Check out our app to order directly and save even more with zero platform commissions!</p>",
    featuredImage: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&w=800&q=80",
    author: "Restroon Team"
  },
  {
    title: "Why Small Cafes Should Avoid 30% Commission Platforms",
    slug: "why-small-cafes-should-avoid-high-commissions",
    excerpt: "High commission food delivery apps are squeezing local cafes. Learn why it's time to build direct relationships with your customers.",
    content: "<h2>The True Cost of Delivery Apps</h2><p>When an order is placed through a major food delivery app, small cafes often lose between 25% to 30% of the revenue to commissions. This margin erosion makes it nearly impossible for local, independent shops to survive, let alone thrive.</p><h2>Loss of Customer Data</h2><p>Beyond the financial hit, these platforms keep customer data hidden. You don't know who your regulars are, making it impossible to build loyalty programs or market directly to them.</p><h2>The Alternative</h2><p>Platforms like Restroon empower you to take back control. By charging zero or minimal flat fees, you keep your hard-earned money and interact directly with your patrons. It's time to rethink the delivery model.</p>",
    featuredImage: "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&w=800&q=80",
    author: "Ashwani Kumar"
  },
  {
    title: "Restaurant Marketing Tips for 2026",
    slug: "restaurant-marketing-tips-2026",
    excerpt: "Modern strategies to attract more footfall and online orders for your local cafe.",
    content: "<h2>1. Leverage Short-Form Video</h2><p>Show behind-the-scenes footage of your kitchen. People love seeing how their latte art is poured or how fresh pasta is made.</p><h2>2. Claim Your Digital Real Estate</h2><p>Ensure your Google My Business profile is updated with high-quality photos and accurate timings. Make sure you are listed on Restroon to capture local intent.</p><h2>3. Host Local Events</h2><p>Open mic nights, local artist galleries, or board game evenings can transform your cafe from a simple eatery into a community hub.</p>",
    featuredImage: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&w=800&q=80",
    author: "Restroon Team"
  }
];

export const getBlogs = async (req, res) => {
  try {
    let blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    
    // Auto-seed if database is completely empty (For AdSense startup)
    if (blogs.length === 0) {
      console.log('No blogs found, seeding default AdSense blogs...');
      await Blog.insertMany(defaultBlogs);
      blogs = await Blog.find({ isPublished: true }).sort({ createdAt: -1 });
    }

    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    console.error('Get Blogs Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getBlogBySlug = async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    );
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error('Get Blog Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
