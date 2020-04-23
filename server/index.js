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
    weight: WeightMaxMin
    height: HeightMaxMin
    fleeRate: Float
    evolutionRequirements: RequiredToEvo
    evolutions: [String]
    maxCP: Int
    maxHP: Int
    attacks: AllAtks
  }

  type WeightMaxMin {
    minimum: String
    maximum: String
  }

  type HeightMaxMin {
    minimum: String
    maximum: String
  }

  type RequiredToEvo {
    amount: Int
    name: String
  }

  type AllAtks {
    fast: [Attack]
    special: [Attack]
  }

  type Attack {
    name: String
    type: String
    damage: Int
  }

  
  type Query {
    Pokemons: [Pokemon]
    Pokemon(name: String, id: String): Pokemon
    Attacks(attacks: String): [Pokemon]
    GetPokemonByType(types: String): [Pokemon]
    GetPokemonByAttack(name: String): [Pokemon]
  }

  input UpdateType {
    types: String
  }

  type Mutation {
    AddType(name: String, types: String): Pokemon
  }

`);
// for mutations you can use input keyword, not type keyword

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
  Attacks: (request) => {
    if (request.attacks === "fast") {
      return data.attacks.fast;
    } else if (request.attacks === "special") {
      return data.attacks.special;
    }
  },
  GetPokemonByType: (request) => {
    const pokemonTypeArr = data.pokemon.filter((eachPokemon) => {
      if (eachPokemon.types.includes(request.types)) {
        return eachPokemon;
      }
    });
    return pokemonTypeArr;
  },
  GetPokemonByAttack: (request) => {
    const pokemonAttackFilter = data.pokemon.filter((eachPokemon) => {
      for (const key of eachPokemon.attacks.fast) {
        if (request.name === key.name) {
          return eachPokemon;
        }
        for (const key of eachPokemon.attacks.special) {
          if (request.name === key.name) {
            return eachPokemon;
          }
        }
      }
    });
    return pokemonAttackFilter;
  },
  AddType: (request) => {
    const pokeIndex = data.pokemon.findIndex(
      (pokemon) => pokemon.name === request.name
    );
    data.pokemon[pokeIndex].types.push(request.types);
    return data.pokemon[pokeIndex];
  },
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
