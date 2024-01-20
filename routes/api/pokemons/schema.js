const Joi = require("joi");
const { pokemonTypes } = require("../../../pokemonTypes");

const addPokemonBodySchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  types: Joi.array()
    .items(
      Joi.string()
        .trim()
        .valid(...pokemonTypes)
    )
    .min(1)
    .max(2)
    .required(),
  id: Joi.number().required(),
  imgUrl: Joi.string().trim().min(1).required(),
}).options({ abortEarly: false });

const updatePokemonBodySchema = Joi.object({
  name: Joi.string().trim().min(1).required(),
  types: Joi.array()
    .items(
      Joi.string()
        .trim()
        .valid(...pokemonTypes)
    )
    .min(1)
    .max(2)
    .required(),
  url: Joi.string().trim().min(1).required(),
});

const updatePokemonParamsSchema = Joi.object({
  id: Joi.number().integer().required(),
});

module.exports = {
  addPokemonBodySchema,
  updatePokemonBodySchema,
  updatePokemonParamsSchema,
};
