const fs = require("fs");
const crypto = require("crypto");
const { sendResponse, createError } = require("../../utils");
const { addPokemonBodySchema, updatePokemonBodySchema } = require("./schema");
const { pokemonTypes } = require("../../../pokemonTypes");
const _ = require("lodash");

const controller = {
  getPokemons: (req, res, next) => {
    try {
      // Read query parameters from the request
      const { page, limit, search, type } = req.query;
      const parsedPage = parseInt(page) || 1;
      const parsedLimit = parseInt(limit) || POKEMONS_PER_PAGE;

      // Read data from db.json then parse to JSobject
      let db = fs.readFileSync("db.json", "utf-8");
      db = JSON.parse(db);
      const { data } = db;

      // Filter by name if 'name' query parameter is provided
      const filteredByName = search
        ? data.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(search.toLowerCase())
          )
        : data;

      // Filter by type if 'type' query parameter is provided
      const filteredByType = type
        ? data.filter((pokemon) => pokemon.types.includes(type.toLowerCase()))
        : filteredByName;

      const filteredByBoth =
        search && type
          ? filteredByType.filter((pokemon) =>
              pokemon.name.toLowerCase().includes(search.toLowerCase())
            )
          : filteredByType;

      if (filteredByBoth.length === 0) {
        if (search && type) {
          throw createError(
            404,
            `No Pokémon found for name: ${search} and type: ${type}`
          );
        } else if (type) {
          throw createError(404, `No Pokémon found for type: ${type}`);
        } else if (search) {
          throw createError(404, `No Pokémon found for name: ${search}`);
        }
      }

      const startIndex = (parsedPage - 1) * parsedLimit;
      const endIndex = parsedPage * parsedLimit;
      const paginatedPokemons = filteredByBoth.slice(startIndex, endIndex);

      // Send response
      sendResponse(res, 200, paginatedPokemons);
    } catch (error) {
      next(error);
    }
  },

  getPokemonsById: (req, res, next) => {
    try {
      // Read data from db.json then parse to JS object
      let db = fs.readFileSync("db.json", "utf-8");
      db = JSON.parse(db);
      const { data } = db;

      // Get the type route parameter from the request
      const pokemonId = parseInt(req.params.id);

      // Find the index of the Pokémon with the specified ID
      const pokemonIndex = data.findIndex(
        (pokemon) => pokemon.id === pokemonId
      );

      // If pokemon is not found, throw 404 error
      if (pokemonIndex < 0 || pokemonIndex >= data.length) {
        throw createError(404, `Pokémon with ID ${pokemonId} is not found.`);
      }

      // Determine the previous and next pokemon id
      const previousPokemonId = pokemonId === 1 ? data.length : pokemonId - 1;
      console.log("previousId", previousPokemonId);

      const nextPokemonId = pokemonId === data.length ? 1 : pokemonId + 1;
      console.log("nextId", nextPokemonId);

      // Retrieve data for the current, previous, and next Pokémon
      const currentPokemon = data[pokemonIndex];
      const previousPokemon = data[previousPokemonId - 1];
      const nextPokemon = data[nextPokemonId - 1];

      const responseData = {
        pokemon: currentPokemon,
        previousPokemon: previousPokemon,
        nextPokemon: nextPokemon,
      };

      // Send response with filteredPokemonsById
      sendResponse(res, 200, responseData);
    } catch (error) {
      next(error);
    }
  },

  addPokemon: (req, res, next) => {
    try {
      const { name, id, imgUrl, types } = req.body;

      //Read data from db.json then parse to JSobject
      let db = fs.readFileSync("db.json", "utf-8");
      db = JSON.parse(db);
      const { data } = db;

      // Check if Pokemon already exists
      const existingPokemon = data.find(
        (pokemon) => pokemon.name === name || pokemon.id === id
      );
      if (existingPokemon) {
        throw createError(409, "Pokemon is already added");
      }

      // post processing
      const newPokemon = {
        name,
        id,
        imgUrl,
        types,
      };

      // Add new Pokemon
      data.push(newPokemon);
      //Add new Pokemon to db JS object
      db.data = data;
      db.totalPokemons = data.length;
      //db JSobject to JSON string
      db = JSON.stringify(db, null, 2);
      //write and save to db.json
      fs.writeFileSync("db.json", db);

      //   res.status(200).send(newBook);
      sendResponse(res, 200, newPokemon);
    } catch (error) {
      next(error);
    }
  },

  updatePokemon: (req, res, next) => {
    try {
      const pokemonId = parseInt(req.params.id);

      //put processing
      //Read data from db.json then parse to JSobject
      let db = fs.readFileSync("db.json", "utf-8");
      db = JSON.parse(db);
      const { data } = db;

      // Find the index of the Pokémon with the specified ID
      const pokemonIndex = data.findIndex(
        (pokemon) => pokemon.id === pokemonId
      );

      // If pokemon is not found, throw 404 error
      if (pokemonIndex < 0 || pokemonIndex >= data.length) {
        throw createError(404, `Pokémon with ID ${pokemonId} is not found.`);
      }

      // Compare existing Pokemon with update one
      const existingPokemon = db.data[pokemonIndex];
      const updateKeys = Object.keys(req.body);

      const hasUpdated = updateKeys.some(
        // (key) => existingPokemon[key] !== req.body[key]
        (key) => !_.isEqual(existingPokemon[key], req.body[key])
      );
      console.log("hasUpdated:", hasUpdated); // Debugging

      if (!hasUpdated) {
        throw createError(400, `Nothing has been updated`);
      }

      // Check for missing info
      const missingInfo = updateKeys.filter((key) => !req.body[key]);
      if (missingInfo.length > 0) {
        throw createError(400, `Missing body info: ${missingInfo.join(", ")}`);
      }

      //Update new content to db book JSObject
      const updatedPokemon = { ...existingPokemon, ...req.body };
      db.data[pokemonIndex] = updatedPokemon;

      //db JSobject to JSON string
      db = JSON.stringify(db, null, 2);
      //write and save to db.json
      fs.writeFileSync("db.json", db);

      sendResponse(res, 200, updatedPokemon);
    } catch (error) {
      next(error);
    }
  },

  deletePokemon: (req, res, next) => {
    try {
      const pokemonId = parseInt(req.params.id);

      //delete processing
      //Read data from db.json then parse to JSobject
      let db = fs.readFileSync("db.json", "utf-8");
      db = JSON.parse(db);
      const { data } = db;

      // Find Pokemon by id
      const pokemonIndex = data.findIndex(
        (pokemon) => pokemon.id === pokemonId
      );

      // If pokemon is not found, throw 404 error
      if (pokemonIndex < 0 || pokemonIndex >= data.length) {
        throw createError(404, `Pokémon with ID ${pokemonId} is not found.`);
      }

      // Filter db data object
      db.data = data.filter((pokemon) => pokemon.id !== pokemonId);

      db.totalPokemons = db.data.length;

      //db JSobject to JSON string
      db = JSON.stringify(db, null, 2);
      //write and save to db.json
      fs.writeFileSync("db.json", db);

      //delete send response
      res.status(200).send({});
      sendResponse(res, 200, {});
    } catch (error) {
      next(error);
    }
  },
};

module.exports = controller;
