import { pgTable, serial, text, numeric, timestamp, integer, boolean, uuid, jsonb } from 'drizzle-orm/pg-core';

// 1. Roles table
export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(), // 'super_admin', 'admin', 'editor', 'accountant', 'volunteer_coordinator'
  permissions: text('permissions').array().notNull(),
});

// 2. Users (Profiles) table
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // links to Supabase auth.users.id
  roleId: integer('role_id').references(() => roles.id).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Donors table
export const donors = pgTable('donors', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 4. Causes table
export const causes = pgTable('causes', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description').notNull(),
  goal: numeric('goal').notNull(),
  raised: numeric('raised').default('0').notNull(),
  image: text('image').notNull(),
  impact: text('impact'),
  location: text('location'),
  category: text('category'),
  status: text('status').default('published').notNull(), // 'draft' | 'published'
  featured: boolean('featured').default(false).notNull(),
  seoTitle: text('seo_title'),
  seoDesc: text('seo_desc'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. Donations table
export const donations = pgTable('donations', {
  id: serial('id').primaryKey(),
  donorId: integer('donor_id').references(() => donors.id).notNull(),
  amount: numeric('amount').notNull(),
  causeId: integer('cause_id').references(() => causes.id),
  paymentMethod: text('payment_method').notNull(), // 'razorpay', 'bank_transfer', 'upi', etc.
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpayOrderId: text('razorpay_order_id'),
  status: text('status').default('pending').notNull(), // 'pending' | 'success' | 'failed'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Donation Receipts table
export const donationReceipts = pgTable('donation_receipts', {
  id: serial('id').primaryKey(),
  donationId: integer('donation_id').references(() => donations.id).notNull(),
  receiptNumber: text('receipt_number').notNull().unique(),
  pdfUrl: text('pdf_url').notNull(),
  sentAt: timestamp('sent_at'),
});

// 7. Cause Gallery table
export const causeGallery = pgTable('cause_gallery', {
  id: serial('id').primaryKey(),
  causeId: integer('cause_id').references(() => causes.id).notNull(),
  imageUrl: text('image_url').notNull(),
});

// 8. Gallery Albums table
export const galleryAlbums = pgTable('gallery_albums', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  coverImage: text('cover_image').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 9. Gallery table (extends current gallery structure)
export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  albumId: integer('album_id').references(() => galleryAlbums.id),
  src: text('src').notNull(),
  title: text('title').notNull(),
  category: text('category').notNull(), // 'events', 'food', 'medical', 'education', 'trust', 'celebrations'
  description: text('description').notNull(),
  type: text('type').default('photo').notNull(), // 'photo' | 'video'
  videoUrl: text('video_url'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 10. Banners table
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 11. Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  eventDate: timestamp('event_date').notNull(),
  venue: text('venue').notNull(),
  coverImage: text('cover_image').notNull(),
  registrationLimit: integer('registration_limit'),
  status: text('status').default('published').notNull(), // 'draft' | 'published' | 'completed' | 'cancelled'
  createdAt: timestamp('created_at').defaultNow(),
});

// 12. Event Registrations table
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id).notNull(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  attended: boolean('attended').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 13. Volunteers table
export const volunteers = pgTable('volunteers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  address: text('address'),
  skills: text('skills').array(),
  interests: text('interests').array(),
  availability: text('availability').notNull(),
  experience: text('experience'),
  message: text('message'),
  status: text('status').default('pending').notNull(), // 'pending' | 'approved' | 'rejected'
  createdAt: timestamp('created_at').defaultNow(),
});

// 14. Blogs Categories table
export const blogCategories = pgTable('blog_categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
});

// 15. Blogs table
export const blogs = pgTable('blogs', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(),
  categoryId: integer('category_id').references(() => blogCategories.id),
  tags: text('tags').array().notNull(),
  coverImage: text('cover_image').notNull(),
  status: text('status').default('draft').notNull(), // 'draft' | 'published'
  seoTitle: text('seo_title'),
  seoDesc: text('seo_desc'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 16. Testimonials table
export const testimonials = pgTable('testimonials', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  designation: text('designation').notNull(), // e.g. 'Donor', 'Volunteer', 'Beneficiary'
  testimonial: text('testimonial').notNull(),
  image: text('image'),
  rating: integer('rating').default(5).notNull(),
  type: text('type').default('donor').notNull(), // 'donor' | 'volunteer' | 'impact'
  createdAt: timestamp('created_at').defaultNow(),
});

// 17. Team Members table
export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  designation: text('designation').notNull(),
  profilePhoto: text('profile_photo').notNull(),
  bio: text('bio'),
  socialLinks: jsonb('social_links').default({}).notNull(), // { facebook, twitter, linkedin, instagram }
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 18. Contact Enquiries table
export const contactEnquiries = pgTable('contact_enquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  source: text('source').default('contact_form').notNull(), // 'contact_form' | 'volunteer_form' | 'donation_enquiry'
  status: text('status').default('unread').notNull(), // 'unread' | 'read' | 'replied'
  createdAt: timestamp('created_at').defaultNow(),
});

// 19. Documents table
export const documents = pgTable('documents', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(), // 'legal', 'audit', 'tax_exemption', 'annual_report'
  fileUrl: text('file_url').notNull(),
  version: text('version').default('1.0').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 20. Razorpay Orders table
export const razorpayOrders = pgTable('razorpay_orders', {
  id: text('id').primaryKey(), // razorpay order id (e.g. order_O123xyz)
  amount: numeric('amount').notNull(),
  currency: text('currency').default('INR').notNull(),
  receipt: text('receipt'),
  status: text('status').notNull(), // 'created' | 'attempted' | 'paid'
  createdAt: timestamp('created_at').defaultNow(),
});

// 21. Razorpay Payments table
export const razorpayPayments = pgTable('razorpay_payments', {
  id: text('id').primaryKey(), // razorpay payment id (e.g. pay_P123xyz)
  orderId: text('order_id').references(() => razorpayOrders.id).notNull(),
  amount: numeric('amount').notNull(),
  status: text('status').notNull(), // 'captured' | 'failed' | 'refunded'
  email: text('email'),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 22. Razorpay Refunds table
export const razorpayRefunds = pgTable('razorpay_refunds', {
  id: text('id').primaryKey(), // razorpay refund id
  paymentId: text('payment_id').references(() => razorpayPayments.id).notNull(),
  amount: numeric('amount').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// 23. Payment Webhooks table
export const paymentWebhooks = pgTable('payment_webhooks', {
  id: serial('id').primaryKey(),
  eventType: text('event_type').notNull(), // e.g. payment.captured
  payload: jsonb('payload').notNull(),
  status: text('status').default('pending').notNull(), // 'pending' | 'processed' | 'failed'
  createdAt: timestamp('created_at').defaultNow(),
});

// 24. Settings table (extends existing settings structure)
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  siteTitle: text('site_title').default('Sri Viswa Charitable Trust').notNull(),
  whatsappNumber: text('whatsapp_number').default('+919944534098').notNull(),
  phone: text('phone').default('+91 99445 34098').notNull(),
  email: text('email').default('noreply@srivisawacharitabletrust.com').notNull(),
  address: text('address').default('No. 128, Mani Nagar 2nd Street, Sivanandhapuram, Saravanampatti, Coimbatore - 641035').notNull(),
  tawkPropertyId: text('tawk_property_id').default(''),
  tawkWidgetId: text('tawk_widget_id').default(''),
  razorpayApiKey: text('razorpay_api_key').default(''),
  smtpConfig: jsonb('smtp_config').default({}).notNull(),
  socialLinks: jsonb('social_links').default({}).notNull(),
  seoTitle: text('seo_title'),
  seoDesc: text('seo_desc'),
});

// 25. Audit Logs table
export const auditLogs = pgTable('audit_logs', {
  id: serial('id').primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: text('action').notNull(), // e.g. 'Created Cause', 'Approved Volunteer'
  module: text('module').notNull(), // e.g. 'Causes', 'Volunteers'
  ipAddress: text('ip_address'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 26. Payment table (required by legacy schema mappings)
export const payment = pgTable('payment', {
  id: integer('id').primaryKey().default(1),
  razorpayApiKey: text('razorpay_api_key').default(''),
  bankName: text('bank_name').default('State Bank of India'),
  accountNumber: text('account_number').default('12345678901'),
  ifscCode: text('ifsc_code').default('SBIN0001234'),
  accountName: text('account_name').default('Sri Viswa Charitable Trust'),
  branchName: text('branch_name').default('Saravanampatti Branch'),
  upiId: text('upi_id').default('sriviswa@okaxis'),
  qrCodeUrl: text('qr_code_url').default(''),
});

// 27. Queries table (required by legacy schema mappings)
export const queries = pgTable('queries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

