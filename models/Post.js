const mongoose = require('mongoose');

// Define the post schema
const postSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '匿名'
    },
    location: {
        type: String,
        default: '未知',
        select: false  // Not returned in queries
    },
    ipAddress: {
        type: String,
        select: false  // Not returned in queries
    },
    title: {
        type: String,
        required: [true, '请输入标题']
    },
    content: {
        type: String,
        required: [true, '请输入内容'],
        maxlength: [1800, '内容不能超过1800字']
    },
    tags: {
        type: [String],
        required: [true, '请选择至少一个标签'],
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: '请选择至少一个标签'
        }
    },
    userType: {
        type: String,
        required: [true, '请选择你的身份类型'],
        enum: {
            values: ['immigrant', 'firstGen', 'secondGen'],
            message: '请选择有效的身份类型'
        }
    },
    background: {
        type: [String],
        default: []
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    // Device information
    device: {
        userAgent: { type: String, select: false },     // User device information
        platform: { type: String, select: false },      // Operating system
        browser: { type: String, select: false }        // Browser type
    },
    // Interaction data
    interactions: {
        views: { type: Number, default: 0 },      // Views
        shares: { type: Number, default: 0 },     // Shares
        reports: { type: Number, default: 0 }     // Reports
    },
    // Content analysis
    contentAnalysis: {
        wordCount: { type: Number, select: false },         // Word count
        topicCategory: { type: String, select: false },     // Topic category
        sentiment: { type: String, select: false }          // Sentiment
    },
    // Access resource
    referrer: {
        type: String,
        select: false
    },
    // Time to post
    compositionTime: {
        type: Number,  // Unit: seconds
        select: false
    }
}, {
    timestamps: true  // Add createdAt and updatedAt
});

module.exports = mongoose.model('Post', postSchema);