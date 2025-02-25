import Joi from "joi";

export const registerValidate = Joi.object({
  first_name: Joi.string().min(2).max(50).required(),
  last_name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});
export const loginValidate = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().min(8).required(),
});
