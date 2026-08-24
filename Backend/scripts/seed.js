require('dotenv').config();

const connectDatabase = require('../config/database');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Event = require('../models/Event');
const Announcement = require('../models/Announcement');

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@communityconnect.local').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'CommunityConnect!2026';

function futureDate(daysFromToday) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromToday);
  date.setHours(10, 0, 0, 0);
  return date;
}

async function ensureAdmin() {
  let admin = await User.findOne({ email: adminEmail }).select('+password');

  if (!admin) {
    admin = await User.create({
      name: 'Community Connect Team',
      email: adminEmail,
      password: adminPassword,
      location: 'Community Office',
      role: 'admin',
    });
    console.log(`Created administrator: ${adminEmail}`);
    return admin;
  }

  if (admin.role !== 'admin') {
    admin.role = 'admin';
    await admin.save();
    console.log(`Promoted existing user to administrator: ${adminEmail}`);
  } else {
    console.log(`Administrator already exists: ${adminEmail}`);
  }

  return admin;
}

async function upsertPost(admin, definition) {
  const post = await Post.findOneAndUpdate(
    { title: definition.title, author: admin._id },
    { $setOnInsert: { ...definition, author: admin._id } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  await Post.updateOne({ _id: post._id }, { $addToSet: { likes: admin._id } });
  return post;
}

async function upsertEvent(admin, definition) {
  await Event.findOneAndUpdate(
    { title: definition.title, createdBy: admin._id },
    { $setOnInsert: { ...definition, createdBy: admin._id, attendees: [admin._id] } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertAnnouncement(admin, definition) {
  await Announcement.findOneAndUpdate(
    { title: definition.title, createdBy: admin._id },
    { $setOnInsert: { ...definition, createdBy: admin._id } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

async function upsertComment(admin, post, content) {
  await Comment.updateOne(
    { author: admin._id, post: post._id, content },
    { $setOnInsert: { author: admin._id, post: post._id, content } },
    { upsert: true, setDefaultsOnInsert: true }
  );
}

async function seed() {
  await connectDatabase();
  const admin = await ensureAdmin();

  const posts = await Promise.all([
    upsertPost(admin, {
      title: 'Saturday clean-up at Greenfield Park',
      content: 'Bring gloves, a refillable water bottle, and a neighbour. We will meet by the east gate at 9:00 AM, share supplies, and finish with coffee from the community kiosk. Families and first-time volunteers are warmly welcome.',
    }),
    upsertPost(admin, {
      title: 'The neighbourhood book swap is back',
      content: 'Our little library has fresh shelves this week. Leave a book you enjoyed, take one that catches your eye, and add a short note inside if you would like to recommend it to the next reader.',
    }),
    upsertPost(admin, {
      title: 'Looking for a relaxed evening walking group?',
      content: 'A few neighbours are starting a friendly 30-minute walk every Wednesday at sunset. The pace is easy, the route is well lit, and everyone is welcome to join for all or part of it.',
    }),
    upsertPost(admin, {
      title: 'Thank you for making the street brighter',
      content: 'The new planters outside the community hall are already full of colour. Thank you to everyone who donated seedlings, soil, time, and encouraging words during last weekend’s planting day.',
    }),
  ]);

  await Promise.all([
    upsertComment(admin, posts[0], 'I will bring extra gloves and a few spare litter pickers. See you there!'),
    upsertComment(admin, posts[1], 'Children’s books and cookbooks are especially welcome this month.'),
    upsertComment(admin, posts[2], 'Meet beside the library entrance at 6:30 PM. We will introduce ourselves before setting off.'),
  ]);

  await Promise.all([
    upsertEvent(admin, {
      title: 'Greenfield Park clean-up',
      description: 'A relaxed morning of tidying paths, planting a few flowers, and getting to know neighbours. Tools and refreshments are provided.',
      date: futureDate(5),
      time: '9:00 AM',
      location: 'Greenfield Park, East Gate',
    }),
    upsertEvent(admin, {
      title: 'Community supper and story night',
      description: 'Share a simple meal, meet new people, and listen to short stories from local residents. Bring a dish if you can, but come either way.',
      date: futureDate(12),
      time: '6:30 PM',
      location: 'Community Hall, Willow Street',
    }),
    upsertEvent(admin, {
      title: 'Saturday skills swap',
      description: 'Offer a small skill, learn something useful, or simply meet people who enjoy making and fixing things together.',
      date: futureDate(19),
      time: '11:00 AM',
      location: 'Library Meeting Room',
    }),
  ]);

  await Promise.all([
    upsertAnnouncement(admin, {
      title: 'Welcome to Community Connect',
      content: 'This is your shared space for local updates, events, ideas, and practical help. Create an account to join the conversation and make your neighbourhood stronger.',
    }),
    upsertAnnouncement(admin, {
      title: 'New community noticeboard hours',
      content: 'The community hall noticeboard is now open Monday to Saturday, 9:00 AM to 6:00 PM. Drop by to discover activities, groups, and volunteer opportunities.',
    }),
    upsertAnnouncement(admin, {
      title: 'Share your local good news',
      content: 'Know a helpful neighbour, a new small business, or an upcoming activity? Post it here so the whole community can celebrate and take part.',
    }),
  ]);

  console.log('Sample community content is ready.');
}

seed()
  .catch((error) => {
    console.error('Unable to seed the database:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    const mongoose = require('mongoose');
    await mongoose.connection.close();
  });
