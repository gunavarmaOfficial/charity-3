const fs = require('fs');
const path = require('path');
const postgres = require('postgres');

// Parse .env manually
const envPath = path.join(__dirname, '..', '.env');
if (!fs.existsSync(envPath)) {
  console.error('.env file does not exist');
  process.exit(1);
}

const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    let val = parts.slice(1).join('=').trim();
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.substring(1, val.length - 1);
    }
    env[key] = val;
  }
});

const databaseUrl = env.DATABASE_URL;
if (!databaseUrl || databaseUrl.includes('[YOUR-PASSWORD]')) {
  console.error('DATABASE_URL is not set or placeholder is not replaced in .env');
  process.exit(1);
}

const sql = postgres(databaseUrl);

async function seed() {
  try {
    console.log('Seeding Supabase Postgres database...');

    // 1. Seed Roles
    console.log('Seeding Roles...');
    await sql`DELETE FROM roles`;
    const insertedRoles = await sql`
      INSERT INTO roles (name, permissions) VALUES
      ('super_admin', ARRAY['*']),
      ('admin', ARRAY['donations', 'donors', 'causes', 'events', 'volunteers', 'gallery', 'blogs', 'testimonials', 'team', 'cms', 'documents', 'enquiries', 'reports', 'settings', 'audit-logs']),
      ('editor', ARRAY['gallery', 'blogs', 'testimonials', 'team', 'cms']),
      ('accountant', ARRAY['donations', 'payments', 'reports', 'settings']),
      ('volunteer_coordinator', ARRAY['volunteers', 'events'])
      RETURNING id, name
    `;
    console.log('Roles seeded:', insertedRoles.map(r => r.name));

    // Map role names to database ids
    const roleMap = {};
    insertedRoles.forEach(r => {
      roleMap[r.name] = r.id;
    });

    // 2. Settings
    console.log('Seeding Settings...');
    await sql`DELETE FROM settings`;
    await sql`
      INSERT INTO settings (id, site_title, whatsapp_number, phone, email, address, tawk_property_id, tawk_widget_id, smtp_config, social_links)
      VALUES (
        1, 
        'Sri Viswa Charitable Trust', 
        '+919944534098', 
        '+91 99445 34098', 
        'info@srivisawacharitabletrust.com', 
        'No. 128, Mani Nagar 2nd Street, Sivanandhapuram, Saravanampatti, Coimbatore - 641035', 
        '', 
        '',
        '{"host": "smtp.resend.com", "port": 587, "user": "resend", "pass": ""}'::jsonb,
        '{"facebook": "https://facebook.com", "instagram": "https://instagram.com", "youtube": "https://youtube.com", "linkedin": "https://linkedin.com"}'::jsonb
      )
    `;

    // 3. Payment details
    console.log('Seeding Payment Details...');
    await sql`DELETE FROM payment`;
    await sql`
      INSERT INTO payment (id, razorpay_api_key, bank_name, account_number, ifsc_code, account_name, branch_name, upi_id, qr_code_url)
      VALUES (
        1,
        '',
        'State Bank of India',
        '39218204918',
        'SBIN0001234',
        'Sri Viswa Charitable Trust',
        'Saravanampatti Branch',
        'sriviswa@okaxis',
        ''
      )
    `;

    // 4. Banners
    console.log('Seeding Banners...');
    await sql`DELETE FROM banners`;
    await sql`
      INSERT INTO banners (image_url) VALUES
      ('https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1200'),
      ('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200'),
      ('https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1200')
    `;

    // 5. Causes
    console.log('Seeding Causes...');
    await sql`DELETE FROM causes`;
    const insertedCauses = await sql`
      INSERT INTO causes (title, slug, description, goal, raised, image, impact, location, category, status, featured, seo_title, seo_desc)
      VALUES
      ('Education for All', 'education-for-all', 'Providing school supplies, uniforms, and tuition support to underprivileged kids. We believe education is the fundamental right of every child. Through this program, Sri Viswa Charitable Trust supplies notebooks, pencils, school uniforms, bags, and tuition fees for orphans and poor kids across Tamil Nadu villages.', 2500000, 1750000, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', '5,000+ students supported', 'Tamil Nadu', 'Education', 'published', true, 'Educating Poor Kids in Tamil Nadu', 'Donate to fund school fee and books for orphans'),
      ('Rural Mobile Medical Camp', 'rural-medical-camp', 'Free healthcare consults and medicines for isolated villagers. Many remote communities lack primary health check facilities. We arrange periodic mobile clinics with general physicians, pediatricians, and free distribution of prescribed medicines, vitamins, and supplements.', 3000000, 1200000, 'https://images.unsplash.com/photo-1584515933487-779824d29309', '10,000+ patients treated', 'Rural Tamil Nadu', 'Healthcare', 'published', false, 'Free Rural Medical Camps', 'Support healthcare consults and health screening for villagers'),
      ('Women Self Employment', 'women-self-employment', 'Tailoring and craft training to help single mothers earn independently. This initiative targets single mothers and women in distress. We provide free 3-month tailoring classes and distribute free sewing machines to graduates, enabling them to earn a sustainable livelihood from home.', 1500000, 900000, 'https://images.unsplash.com/photo-1509099836639-18ba1795216d', '2,000+ women empowered', 'Chennai, Madurai', 'Empowerment', 'published', true, 'Tailoring Training for Distressed Women', 'Empower single mothers with tailoring machines and micro business skills')
      RETURNING id, title
    `;
    console.log('Causes seeded.');

    // Map cause titles to database ids
    const causeMap = {};
    insertedCauses.forEach(c => {
      causeMap[c.title] = c.id;
    });

    // 6. Gallery Albums & Gallery
    console.log('Seeding Gallery...');
    await sql`DELETE FROM gallery`;
    await sql`DELETE FROM gallery_albums`;
    const albums = await sql`
      INSERT INTO gallery_albums (name, cover_image) VALUES
      ('Medical Camps 2025', 'https://images.unsplash.com/photo-1584515933487-779824d29309'),
      ('School Book Drives', 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6')
      RETURNING id, name
    `;
    
    await sql`
      INSERT INTO gallery (album_id, src, title, category, description, type) VALUES
      (${albums[0].id}, 'https://images.unsplash.com/photo-1584515933487-779824d29309', 'Coimbatore Camp Checkup', 'Medical Camps', 'Physician checking village kid vitals during free camp', 'photo'),
      (${albums[1].id}, 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', 'Notebook distribution ceremony', 'Education Programs', 'Trustees giving away school kits', 'photo')
    `;

    // 7. Donors & Donations
    console.log('Seeding Donors & Donations...');
    await sql`DELETE FROM donations`;
    await sql`DELETE FROM donors`;
    const insertedDonors = await sql`
      INSERT INTO donors (name, email, phone, address) VALUES
      ('Ramesh Kumar', 'ramesh@example.com', '9876543210', '12, Gandhipuram, Coimbatore'),
      ('Anitha Raj', 'anitha@example.com', '9876543211', '45, Adyar, Chennai'),
      ('Srinivasan S', 'srini@example.com', '9876543212', '78, KK Nagar, Madurai'),
      ('Venkatesh Prasad', 'venky@example.com', '9876543213', '90, Jayanagar, Bangalore'),
      ('Meera Nair', 'meera@example.com', '9876543214', '34, Vyttila, Cochin')
      RETURNING id, name
    `;

    // Add donations spanning past 6 months to make graphs beautiful
    const dIds = insertedDonors.map(d => d.id);
    await sql`
      INSERT INTO donations (donor_id, amount, cause_id, payment_method, status, notes, created_at) VALUES
      (${dIds[0]}, 5000.00, ${causeMap['Education for All']}, 'razorpay', 'success', 'Keep up the good work!', NOW() - INTERVAL '5 months'),
      (${dIds[1]}, 10000.00, ${causeMap['Rural Mobile Medical Camp']}, 'razorpay', 'success', 'Medical camp sponsorship', NOW() - INTERVAL '4 months'),
      (${dIds[2]}, 2500.00, ${causeMap['Women Self Employment']}, 'upi', 'success', 'Livelihood support', NOW() - INTERVAL '3 months'),
      (${dIds[3]}, 15000.00, ${causeMap['Education for All']}, 'bank_transfer', 'success', 'Corporate donor matches', NOW() - INTERVAL '2 months'),
      (${dIds[4]}, 7500.00, ${causeMap['Rural Mobile Medical Camp']}, 'razorpay', 'success', 'Monthly contribution', NOW() - INTERVAL '1 month'),
      (${dIds[0]}, 1000.00, ${causeMap['Education for All']}, 'razorpay', 'failed', 'Payment failed at gateway', NOW() - INTERVAL '15 days'),
      (${dIds[1]}, 3000.00, ${causeMap['Women Self Employment']}, 'razorpay', 'success', 'Sponsoring sewing machine unit', NOW())
    `;

    // 8. Events & Registrations
    console.log('Seeding Events...');
    await sql`DELETE FROM event_registrations`;
    await sql`DELETE FROM events`;
    const insertedEvents = await sql`
      INSERT INTO events (title, description, event_date, venue, cover_image, registration_limit, status) VALUES
      ('Annadhanam & Food Drive', 'Providing hot nutritious meals to 500 homeless individuals in city slums.', NOW() + INTERVAL '10 days', 'Coimbatore Central Slum Areas', 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c', 100, 'published'),
      ('Rural Medical Camp Coimbatore', 'Providing primary pediatric care checkups and distributing medicines.', NOW() - INTERVAL '15 days', 'Saravanampatti High School Ground', 'https://images.unsplash.com/photo-1584515933487-779824d29309', 50, 'completed')
      RETURNING id, title
    `;

    await sql`
      INSERT INTO event_registrations (event_id, name, email, phone, attended) VALUES
      (${insertedEvents[0].id}, 'Karthik Raja', 'karthik@example.com', '9988776655', false),
      (${insertedEvents[1].id}, 'Sandhya S', 'sandhya@example.com', '9988776654', true)
    `;

    // 9. Volunteers
    console.log('Seeding Volunteers...');
    await sql`DELETE FROM volunteers`;
    await sql`
      INSERT INTO volunteers (name, email, phone, address, skills, availability, status) VALUES
      ('Rahul Dravid', 'rahul.v@example.com', '9888877777', 'Indiranagar, Bangalore', ARRAY['teaching', 'coordination'], 'Weekends', 'approved'),
      ('Priya Shah', 'priya.s@example.com', '9888877776', 'Saravanampatti, Coimbatore', ARRAY['event management', 'first aid'], 'Flexible', 'pending')
    `;

    // 10. Blog Categories & Blogs
    console.log('Seeding Blogs...');
    await sql`DELETE FROM blogs`;
    await sql`DELETE FROM blog_categories`;
    const blogCat = await sql`
      INSERT INTO blog_categories (name, slug) VALUES
      ('Healthcare Outreach', 'healthcare-outreach'),
      ('Education Drives', 'education-drives')
      RETURNING id, name
    `;

    await sql`
      INSERT INTO blogs (title, slug, content, category_id, tags, cover_image, status, seo_title, seo_desc) VALUES
      ('Sponsoring 10 Orphans for School', 'sponsoring-school-kids', 'Education holds the key to escaping poverty. Sri Viswa Trust is proud to cover the complete schooling fee, books, and logistics costs for 10 orphans who lost parents to Covid. Here is how you can sponsor too...', ${blogCat[1].id}, ARRAY['education', 'sponsor'], 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6', 'published', 'School fee sponsorship for orphans', 'Support Covid orphan child school costs in Tamil Nadu'),
      ('Medical Camps in Saravanampatti', 'saravanampatti-medical-camp-recap', 'We successfully screened over 180 villagers and children in our medical camp on May 28, 2026. General conditions diagnosed were malnutrition and early iron deficiency in women...', ${blogCat[0].id}, ARRAY['medical', 'coimbatore'], 'https://images.unsplash.com/photo-1584515933487-779824d29309', 'published', 'Recap of Saravanampatti free camp', 'Sri Viswa Trust medical screening statistics in Saravanampatti')
    `;

    // 11. Testimonials
    console.log('Seeding Testimonials...');
    await sql`DELETE FROM testimonials`;
    await sql`
      INSERT INTO testimonials (name, designation, testimonial, image, rating, type) VALUES
      ('Ramesh Kumar', 'Merchant & Regular Donor', 'Sri Viswa Charitable Trust executes their campaigns with absolute transparency. I regularly receive receipt vouchers and impact stories for my contributions.', '', 5, 'donor'),
      ('Rahul Dravid', 'Volunteer since 2024', 'Volunteering for their weekend food distribution drives has been eye opening. Extremely dedicated team and well-planned operations.', '', 5, 'volunteer')
    `;

    // 12. Team Members
    console.log('Seeding Team...');
    await sql`DELETE FROM team_members`;
    await sql`
      INSERT INTO team_members (name, designation, profile_photo, bio, social_links, display_order) VALUES
      ('Guna Varma', 'Founder & Managing Trustee', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e', 'Dedicated social service worker with over 8 years of community experience.', '{"facebook": "https://facebook.com", "linkedin": "https://linkedin.com"}'::jsonb, 1),
      ('Kavitha G', 'Trustee Coordinator', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 'Managing trust partnerships and logistics operations.', '{"instagram": "https://instagram.com"}'::jsonb, 2)
    `;

    // 13. Contact Enquiries
    console.log('Seeding Contact Enquiries...');
    await sql`DELETE FROM contact_enquiries`;
    await sql`
      INSERT INTO contact_enquiries (name, email, phone, subject, message, source, status) VALUES
      ('Arun Prasath', 'arun@example.com', '9000011111', 'Wants to donate grocery bags', 'I want to donate 50 bags of rice for your next slum food distribution event. Please contact me to arrange pick up.', 'contact_form', 'unread'),
      ('Divya Mohan', 'divya@example.com', '9000011112', 'Corporate CSR tie ups', 'We are looking to coordinate with Sri Viswa trust for our next quarterly CSR campaign. Let us schedule a call.', 'donation_enquiry', 'read')
    `;

    // 13b. Queries
    console.log('Seeding Queries...');
    await sql`DELETE FROM queries`;
    await sql`
      INSERT INTO queries (name, email, subject, message) VALUES
      ('Arun Prasath', 'arun@example.com', 'Wants to donate grocery bags', 'I want to donate 50 bags of rice for your next slum food distribution event. Please contact me to arrange pick up.'),
      ('Divya Mohan', 'divya@example.com', 'Corporate CSR tie ups', 'We are looking to coordinate with Sri Viswa trust for our next quarterly CSR campaign. Let us schedule a call.')
    `;

    // 14. Documents
    console.log('Seeding Documents...');
    await sql`DELETE FROM documents`;
    await sql`
      INSERT INTO documents (name, category, file_url, version) VALUES
      ('Trust Registration Deed', 'legal', 'https://fvcxbtoiboxrlyncvjsr.supabase.co/storage/v1/object/public/documents/registration_deed.pdf', '1.0'),
      ('80G Tax Exemption Certificate', 'tax_exemption', 'https://fvcxbtoiboxrlyncvjsr.supabase.co/storage/v1/object/public/documents/80g.pdf', '1.0'),
      ('Annual Audit Report FY 2024-25', 'audit', 'https://fvcxbtoiboxrlyncvjsr.supabase.co/storage/v1/object/public/documents/audit_2025.pdf', '1.0')
    `;

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

seed();
