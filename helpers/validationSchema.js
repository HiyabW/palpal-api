const Joi = require('@hapi/joi')

const authSchema = Joi.object({
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().min(4).required(),
})

const registerSchema = authSchema.keys({
    phone: Joi.string().allow('').optional(),
    name: Joi.string().allow('').optional(),
})

const loginSchema = authSchema

module.exports = {
    authSchema,
    registerSchema,
    loginSchema,
}