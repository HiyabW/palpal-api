const createError = require('http-errors')

const validate = (schema, options = {}) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
        abortEarly: false,
        ...options,
    })

    if (error) {
        const message = error.details.map((detail) => detail.message).join(', ')
        return next(createError.BadRequest(message))
    }

    req.body = value
    next()
}

module.exports = validate
