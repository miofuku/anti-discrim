require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('./models/Post');
const connectDB = require('./db');

const samplePosts = [
  {
    name: 'Alice',
    title: 'My First Experience in Germany',
    content: 'As an immigrant, my first few months in Germany were both exciting and challenging. The language barrier was initially difficult, but I found people to be generally helpful.',
    tags: ['Immigrant', 'Language'],
    userType: 'immigrant',
    background: ['United States']
  },
  {
    name: 'Bob',
    title: 'Navigating Cultural Differences at Work',
    content: 'Being a first-generation German, I often find myself bridging cultural gaps at my workplace. It\'s a unique position that comes with its own set of challenges and rewards.',
    tags: ['At Work', 'Culture'],
    userType: 'firstGen',
    background: ['Germany', 'Turkey']
  },
  {
    name: 'Charlie',
    title: 'Reflections on Identity',
    content: 'As a second-generation German, I\'ve always felt a mix of cultures. Sometimes it\'s confusing, but mostly it\'s enriching. I\'m proud of my heritage and my German identity.',
    tags: ['Identity', 'Culture'],
    userType: 'secondGen',
    background: ['Germany']
  },
  {
    name: 'Diana',
    title: 'Overcoming Language Barriers',
    content: 'Learning German was one of the biggest challenges I faced when I moved here. But with persistence and the help of patient locals, I\'m making progress every day.',
    tags: ['Language', 'Immigrant'],
    userType: 'immigrant',
    background: ['Spain']
  },
  {
    name: 'Evan',
    title: 'Embracing Diversity in Education',
    content: 'As a teacher and a first-generation German, I strive to create an inclusive classroom environment that celebrates our diverse backgrounds.',
    tags: ['At School/Uni', 'Diversity'],
    userType: 'firstGen',
    background: ['Germany', 'Iran']
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