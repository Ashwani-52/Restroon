import Contact from '../models/Contact.model.js';
import { sendContactEmail } from '../utils/email.js';

export const submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Save to DB
    const contact = await Contact.create({
      name,
      email,
      subject,
      message
    });

    // Send email to admin
    await sendContactEmail({ name, email, subject, message });

    res.status(201).json({
      success: true,
      message: 'Your message has been received! We will get back to you soon.',
      contact
    });
  } catch (error) {
    console.error('Submit Contact Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
