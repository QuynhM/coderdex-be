const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { validateSchema } = require("../../utils");
const {
  addPokemonBodySchema,
  updatePokemonBodySchema,
  updatePokemonParamsSchema,
} = require("./schema");

// Routes
router.get("/pokemons", controller.getPokemons);
// router.get("/pokemons/type/:type", controller.getPokemonsByType);
// router.get("/pokemons/name/:name", controller.getPokemonsByName);
router.get("/pokemons/:id", controller.getPokemonsById);

router.post(
  "/pokemons",
  validateSchema(addPokemonBodySchema, "body"),
  controller.addPokemon
);

router.put(
  "/pokemons/:id",
  validateSchema(updatePokemonBodySchema, "body"),
  validateSchema(updatePokemonParamsSchema, "params"),
  controller.updatePokemon
);

router.delete("/pokemons/:id", controller.deletePokemon);

module.exports = router;
