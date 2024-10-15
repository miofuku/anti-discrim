const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const i18n = require('i18n');

// Initialize i18n configuration
i18n.configure({
    locales: ['en', 'zh'],
    directory: path.join(__dirname, '..', 'locales'),
    objectNotation: true
});

// Function to get all unique tags from all locale files
function getAllTags() {
    const tags = new Set();
    const locales = i18n.getLocales();

    locales.forEach(locale => {
        const filePath = path.join(__dirname, '..', 'locales', `${locale}.json`);
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const localeData = JSON.parse(fileContent);

        if (localeData.form && Array.isArray(localeData.form.tags)) {
            localeData.form.tags.forEach(tag => {
                if (typeof tag === 'object' && tag.value) {
                    tags.add(tag.value);
                } else if (typeof tag === 'string') {
                    tags.add(tag);
                }
            });
        }
    });

    return Array.from(tags);
}

const allTags = getAllTags();

const PostSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Anonymous',
    maxlength: 50
  },
  title: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 100
  },
  content: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000
  },
  tags: {
    type: [String],
    enum: allTags,
    default: []
  },
  userType: {
    type: String,
    enum: ['immigrant', 'firstGen', 'secondGen'],
    require: true
  },
  background: {
    type: [String],
    default: []
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Post', PostSchema);