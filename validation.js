const Joi = require('joi');

const postSchema = Joi.object({
  name: Joi.string().allow('').max(50).messages({
    'string.max': 'Name should not exceed 50 characters'
  }),
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.empty': 'Title is required',
      'string.min': 'Title should have at least 3 characters',
      'string.max': 'Title should not exceed 100 characters'
    }),
  content: Joi.string().min(10).max(1000).required()
    .messages({
      'string.empty': 'Content is required',
      'string.min': 'Content should have at least 10 characters',
      'string.max': 'Content should not exceed 1000 characters'
    }),
  type: Joi.string().valid('general', 'question', 'idea').required()
    .messages({
      'any.only': 'Type must be either general, question, or idea'
    })
});

module.exports = {
  postSchema
};