require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const connectDB = require('./db');

const samplePosts = [
  {
    name: 'Alice',
    title: 'My First Post',
    content: 'This is a sample post content. It\'s not very long, but it\'s just for testing purposes.',
    type: 'general',
    tags: ['At work', 'Gender'],
    userType: 'finnish',
    background: ['Finland']
  },
  {
    name: 'Bob',
    title: 'Question about JavaScript',
    content: 'Can someone explain the difference between let and const in JavaScript? I\'m a bit confused about when to use each one.',
    type: 'question',
    tags: ['At school/uni'],
    userType: 'immigrant',
    background: ['United States', 'Germany']
  },
  {
    name: 'Charlie',
    title: 'Idea for a New App',
    content: 'I had an idea for a new app that helps people track their daily water intake. What do you all think about this?',
    type: 'idea',
    tags: ['In business'],
    userType: 'finnish'
    // No background specified (optional field)
  },
  {
    name: 'Diana',
    title: 'Favorite Programming Languages',
    content: 'I\'m curious to know what everyone\'s favorite programming language is and why. Mine is Python because of its simplicity and versatility.',
    type: 'general',
    tags: ['At school/uni', 'Online'],
    userType: 'immigrant',
    background: ['India', 'UK']
  },
  {
    name: 'Evan',
    title: 'Help with MongoDB',
    content: 'I\'m trying to set up MongoDB with my Node.js application, but I\'m running into some issues. Has anyone experienced problems with connection timeouts?',
    type: 'question',
    tags: ['Online', 'At work'],
    userType: 'finnish',
    background: ['Finland', 'Sweden']
  }
];

const generateSamplePosts = async () => {
  try {
    await connectDB();

    // Delete all existing posts
    await Post.deleteMany({});
    console.log('Existing posts deleted.');

    // Insert sample posts
    const insertedPosts = await Post.insertMany(samplePosts);
    console.log(`${insertedPosts.length} sample posts have been inserted.`);

    // Log inserted posts
    insertedPosts.forEach(post => {
      console.log(`Created post: ${post.title} (${post.type}) by ${post.name}`);
      if (post.background && post.background.length > 0) {
        console.log(`  Background: ${post.background.join(', ')}`);
      }
    });

  } catch (error) {
    console.error('Error generating sample posts:', error);
  } finally {
    // Close the database connection
    await mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

generateSamplePosts();