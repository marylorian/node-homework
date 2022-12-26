import Joi from "joi";

const userSchema = Joi.object({
  login: Joi.string().required(),
  password: Joi.string()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{6,64}$"))
    .required(),
  age: Joi.number().min(4).max(130).required(),
});

export default userSchema;
