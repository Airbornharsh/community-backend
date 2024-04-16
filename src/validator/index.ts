import Joi from 'joi'

export const userValidation = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string()
    .regex(/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/)
    .required(),
  password: Joi.string().min(6).required()
})

export const signinValidation = Joi.object({
  email: Joi.string()
    .regex(/^[\w-]+(?:\.[\w-]+)*@(?:[\w-]+\.)+[a-zA-Z]{2,7}$/)
    .required()
})

export const roleNameValidation = Joi.object({
  name: Joi.string().min(2).required()
})

export const communityNameValidation = Joi.object({
  name: Joi.string().min(2).required()
})
