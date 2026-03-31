import express from 'express';
import { submitContact } from '../controllers/contact.controller.js';

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit a contact form inquiry
// @access  Public
router.post('/', submitContact);

export default router;
