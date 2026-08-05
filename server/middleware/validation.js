import Joi from 'joi';

/**
 * Express middleware to validate request body against a Joi schema.
 * @param {Joi.ObjectSchema} schema - Joi validation schema
 */
export const validateBody = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false, allowUnknown: true });
    
    if (error) {
      const errorMessage = error.details.map((detail) => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: errorMessage,
      });
    }
    next();
  };
};

// Validation schemas
export const schemas = {
  register: Joi.object({
    name: Joi.string().required().min(2).max(50).messages({
      'any.required': 'Name is required.',
      'string.min': 'Name must be at least 2 characters.',
      'string.max': 'Name cannot exceed 50 characters.'
    }),
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required.',
      'string.email': 'Please enter a valid email address.'
    }),
    password: Joi.string().required().min(6).messages({
      'any.required': 'Password is required.',
      'string.min': 'Password must be at least 6 characters.'
    }),
    role: Joi.string().valid('mentee', 'mentor').default('mentee'),
  }),
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'any.required': 'Email is required.',
      'string.email': 'Please enter a valid email address.'
    }),
    password: Joi.string().required().messages({
      'any.required': 'Password is required.'
    }),
  }),
  booking: Joi.object({
    mentor: Joi.string().hex().length(24).required().messages({
      'any.required': 'Mentor ID is required.',
      'string.length': 'Invalid Mentor ID format.'
    }),
    sessionDate: Joi.date().required().messages({
      'any.required': 'Session date is required.',
      'date.base': 'Invalid session date format.'
    }),
    sessionTime: Joi.object({
      start: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).required().messages({
        'string.pattern.base': 'Start time must be in HH:MM format.'
      }),
      end: Joi.string().regex(/^([0-9]{2}):([0-9]{2})$/).optional(),
    }).required(),
    duration: Joi.number().min(15).max(180).default(60),
    notes: Joi.string().max(500).allow('', null),
  }),
  goal: Joi.object({
    title: Joi.string().required().max(100).messages({
      'any.required': 'Goal title is required.',
      'string.max': 'Title cannot exceed 100 characters.'
    }),
    description: Joi.string().max(500).allow('', null),
    category: Joi.string().valid('skill', 'career', 'project', 'learning', 'other').default('other'),
    status: Joi.string().valid('not_started', 'in_progress', 'completed', 'on_hold').default('not_started'),
    priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  }),
};
