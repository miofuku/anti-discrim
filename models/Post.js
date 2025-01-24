const mongoose = require('mongoose');

// Define the post schema
const postSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '匿名'
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
            values: ['student', 'worker', 'family', 'refugee', 'other'],
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
    }
});

module.exports = mongoose.model('Post', postSchema);