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
router.get("/", controller.getPokemons);
router.get("/:id", controller.getPokemonsById);

router.post(
  "/",
  validateSchema(addPokemonBodySchema, "body"),
  controller.addPokemon
);

router.put(
  "/:id",
  validateSchema(updatePokemonBodySchema, "body"),
  validateSchema(updatePokemonParamsSchema, "params"),
  controller.updatePokemon
);

router.delete("/:id", controller.deletePokemon);

module.exports = router;
