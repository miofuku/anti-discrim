const Joi = require('joi');

const postSchema = Joi.object({
  name: Joi.string().allow('').max(50)
    .pattern(/^[^<>{}]*$/)
    .messages({
      'string.max': '名字不能超过50个字',
      'string.pattern.base': '名字包含非法字符'
    }),
  title: Joi.string().min(3).max(100)
    .pattern(/^[^<>{}]*$/)
    .required()
    .messages({
      'string.empty': '标题是必填的',
      'string.min': '标题至少3个字',
      'string.max': '标题不能超过100个字',
      'string.pattern.base': '标题包含非法字符'
    }),
  content: Joi.string().min(10).max(1800)
    .pattern(/^[^<>{}]*$/)
    .required()
    .messages({
      'string.empty': '内容是必填的',
      'string.min': '内容至少10个字',
      'string.max': '内容不能超过1800个字',
      'string.pattern.base': '内容包含非法字符'
    }),
  tags: Joi.array().items(Joi.string().valid(
    'language_barrier',
    'bureaucracy',
    'housing_discrimination',
    'workplace_discrimination',
    'education_challenges',
    'healthcare_access',
    'cultural_misunderstandings',
    'social_isolation',
    'public_transport',
    'visa_residence',
    'racism_xenophobia',
    'religious_discrimination'
  )).min(1).required().messages({
    'array.min': '请至少选择一个标签',
    'array.base': '标签格式不正确'
  }),
  userType: Joi.string()
    .valid('immigrant', 'firstGen', 'secondGen')
    .required()
    .messages({
      'any.required': '用户类型是必填的',
      'any.only': '用户类型必须是移民、第一代或第二代'
    }),
  background: Joi.array()
    .items(Joi.string().pattern(/^[^<>{}]*$/))
    .default([])
});

module.exports = {
  postSchema
};