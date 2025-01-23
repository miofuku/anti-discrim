const Joi = require('joi');

const postSchema = Joi.object({
  name: Joi.string().allow('').max(50).messages({
    'string.max': '名字不能超过50个字'
  }),
  title: Joi.string().min(3).max(100).required()
    .messages({
      'string.empty': '标题是必填的',
      'string.min': '标题至少3个字',
      'string.max': '标题不能超过100个字'
    }),
  content: Joi.string().min(10).max(1800).required()
    .messages({
      'string.empty': '内容是必填的',
      'string.min': '内容至少10个字',
      'string.max': '内容不能超过1800个字'
    }),
  tags: Joi.array().items(Joi.string()).default([]),
  userType: Joi.string().valid('immigrant', 'firstGen', 'secondGen').required()
    .messages({
      'any.required': '用户类型是必填的',
      'any.only': '用户类型必须是移民、第一代或第二代'
    }),
  background: Joi.array().items(Joi.string()).default([])
});

module.exports = {
  postSchema
};