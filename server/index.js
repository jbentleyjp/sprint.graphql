const express = require("express");
const graphqlHTTP = require("express-graphql");
const { buildSchema } = require("graphql");
// The data below is mocked.
const data = require("./data");

// The schema should model the full data object available.
const schema = buildSchema(`
  type Pokemon {
    id: String
    name: String
    types: [String]
    resistant: [String]
    weaknesses: [String]
    weight: String
    height: String
    fleeRate: Int
    evolutionRequirements: String
    evolutions: [String]
    maxCP: Int
    maxHP: Int
    attacks: PokemonAttacks
  }
  type PokemonAttacks {
    fast: [PokemonAttack]
    special: [PokemonAttack]
  }
  type PokemonAttack {
    name: String
    type: String
    damage: Int
  }
  type AllAttacks {
    attack: [AttackType]
  }
  type AttackType {
    name: String
    type: String
    damage: Int
  }
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: String): Pokemon
    AllAttacks: [AllAttacks]
    GetAttackType(attacks: String): [Pokemon]

  }

`);

// The root provides the resolver functions for each type of query or mutation.
const root = {
  Pokemons: () => {
    return data.pokemon;
  },
  Pokemon: (request) => {
    return data.pokemon.find(
      (pokemon) => pokemon.id === request.id || pokemon.name === request.name
    );
  },
  GetAttackType: (request) => {
    return data.pokemon.forEach((pokemon) => {
      pokemon.attacks.filter((attackStyle) => {
        if (attackStyle === request) {
          return attackStyle;
        }
      });
    });
  },
  // GetAttackType: (request) => {
  //   for (const keys in data.attacks) {
  //     if (keys === request.type) {
  //       return keys;
  //     }
  //   }
  // },
  // AllAttacks: () => {
  //   const attacksArr = [];
  //   for (const keys in data.attacks) {
  //     attacksArr.push(keys);
  //   }
  //   return attacksArr;
  // },
  // GetAttackTypes: (request) => {
  //   return data.attacks.filter(
  //     (pokemon) =>
  //       pokemon.name === request.name || pokemon.types.includes(request.types)
  //   );
  // },
  // GetFastAttacks: (request) => {
  //   return data.pokemon.forEach((pokemon) =>
  //     pokemon.attacks.fast.filter((atks) => atks.name === request.attacks)
  //   );
  // },
  // GetPokemonWithAttack: () => {
  //   return data.attacks;
  // },
};

// Start your express server!
const app = express();

/*
  The only endpoint for your server is `/graphql`- if you are fetching a resource, 
  you will need to POST your query to that endpoint. Suggestion: check out Apollo-Fetch
  or Apollo-Client. Note below where the schema and resolvers are connected. Setting graphiql
  to 'true' gives you an in-browser explorer to test your queries.
*/
app.use(
  "/graphql",
  graphqlHTTP({
    schema,
    rootValue: root,
    graphiql: true,
  })
);
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Running a GraphQL API server at localhost:${PORT}/graphql`);
});
