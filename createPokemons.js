const fs = require("fs");
const csv = require("csvtojson");
// const root = 'http://localhost:5000';
const createPokemons = async () => {
  let newData = await csv().fromFile("pokemon.csv");

  // Filter the first 721 Pokémon
  newData = newData.slice(0, 721);

  let abilitiesData = await csv().fromFile("abilities.csv");

  let data = JSON.parse(fs.readFileSync("db.json"));
  newData = newData.map((e, index) => {
    const id = e.id;

    const types = [e.Type1.toLowerCase()];
    if (e.Type2) {
      types.push(e.Type2.toLowerCase());
    }

    // Generate random height and weight values within a specified range (e.g., between 0.1 and 3.0 for height, and between 1.0 and 100.0 for weight)
    const randomHeight = (Math.random() * (3.0 - 0.1) + 0.1).toFixed(1); // Adjust the range as needed
    const randomWeight = (Math.random() * (100.0 - 1.0) + 1.0).toFixed(1); // Adjust the range as needed

    // Concatenate "inch" for height and "lbs" for weight
    const heightWithUnit = `${randomHeight} '`;
    const weightWithUnit = `${randomWeight} lbs`;

    return {
      id: index + 1,
      name: e.Name,
      types,
      height: heightWithUnit,
      weight: weightWithUnit,
      url: `http://localhost:8001/images/${index + 1}.png`,
      // url: `./images/${index + 1}.png`,
    };
  });

  data.data = newData;
  data.totalPokemons = newData.length; // Add the total number of Pokémon

  fs.writeFileSync("db.json", JSON.stringify(data, null, 2));
  console.log("DONE");
};

createPokemons();
