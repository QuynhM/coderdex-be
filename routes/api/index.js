var express = require("express");
var router = express.Router();

const pokemonsRouter = require("./pokemons/index.js");
router.use("/pokemons", pokemonsRouter);

module.exports = router;
