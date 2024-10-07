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
  tags: Joi.array().items(Joi.string()).default([]),
  userType: Joi.string().valid('immigrant', 'finnish').default('finnish')
    .messages({
      'any.only': 'User type must be either immigrant or finnish'
    }),
  background: Joi.array().items(Joi.string()).default([])
});

module.exports = {
  postSchema
};