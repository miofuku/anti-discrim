require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const connectDB = require('./db');

const samplePosts = [
  {
    name: 'Maria',
    title: 'Struggling with German Bureaucracy',
    content: 'As a recent immigrant, I found the bureaucratic processes in Germany overwhelming. The language barrier made it even more challenging to navigate the complex system of registrations and permits.',
    tags: ['bureaucracy', 'language_barrier'],
    userType: 'immigrant',
    background: ['Spain']
  },
  {
    name: 'Ahmed',
    title: 'Facing Housing Discrimination',
    content: 'Despite having a stable job, I\'ve faced numerous rejections when applying for apartments. It\'s hard not to feel that my foreign name and background are playing a role in these decisions.',
    tags: ['housing_discrimination', 'racism_xenophobia'],
    userType: 'immigrant',
    background: ['Syria']
  },
  {
    name: 'Leila',
    title: 'Challenges in the German Education System',
    content: 'As a parent, I\'ve struggled to understand and navigate the German school system for my children. The early tracking system feels very different from what we\'re used to.',
    tags: ['education_challenges', 'cultural_misunderstandings'],
    userType: 'immigrant',
    background: ['Turkey']
  },
  {
    name: 'Jamal',
    title: 'Workplace Discrimination Experiences',
    content: 'I\'ve noticed subtle forms of discrimination at my workplace. Despite my qualifications, I\'m often overlooked for promotions and important projects.',
    tags: ['workplace_discrimination', 'racism_xenophobia'],
    userType: 'secondGen',
    background: ['Germany']
  },
  {
    name: 'Sophie',
    title: 'Cultural Misunderstandings in Daily Life',
    content: 'Growing up in a bicultural family, I often find myself caught between two worlds. Simple social interactions can sometimes lead to misunderstandings and awkward situations.',
    tags: ['cultural_misunderstandings', 'social_isolation'],
    userType: 'firstGen',
    background: ['Germany', 'Vietnam']
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
      console.log(`Created post: ${post.title} by ${post.name}`);
      console.log(`  User Type: ${post.userType}`);
      console.log(`  Tags: ${post.tags.join(', ')}`);
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