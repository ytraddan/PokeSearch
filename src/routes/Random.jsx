import PokemonCard from "../components/PokemonCard";
import Loading from "../components/Loading";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const POKEMON_COUNT = 3;
const MAX_POKEMON_ID = 1025;

const fetchAbility = async (abilityName) => {
  const abilityPromise = await fetch(
    `https://pokeapi.co/api/v2/ability/${abilityName}`,
  );
  const abilityData = await abilityPromise.json();

  const ability =
    abilityData.effect_entries[1]?.short_effect ||
    abilityData.flavor_text_entries.filter(
      (entry) => entry.language.name === "en",
    )[0].flavor_text ||
    "No abilities";
  return ability;
};

const fetchPokemon = async (id) => {
  const pokemon = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
  const pokemonData = await pokemon.json();

  const name = pokemonData.name;
  const spriteUrl = pokemonData.sprites.front_default;
  const abilityName = pokemonData.abilities[0].ability.name;
  const ability = await fetchAbility(abilityName);

  return {
    name,
    spriteUrl,
    ability,
  };
};

const getRandomIds = (count) => {
  return Array.from(
    { length: count },
    () => Math.floor(Math.random() * MAX_POKEMON_ID) + 1,
  );
};

export default function Random() {
  const [id, setId] = useState(() => getRandomIds(POKEMON_COUNT));
  const [pokemon, setPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ignore = false;

    const handleFetchPokemon = async () => {
      setIsLoading(true);

      try {
        const pokemonPromises = id.map((id) => fetchPokemon(id));
        const pokemonData = await Promise.all(pokemonPromises);

        if (!ignore) {
          setError(null);
          setPokemon(pokemonData);
        }
      } catch (err) {
        if (!ignore) {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    handleFetchPokemon();
    return () => {
      ignore = true;
    };
  }, [id]);

  const handleClick = () => {
    setId(getRandomIds(POKEMON_COUNT));
  };

  if (!pokemon)
    return (
      <div className="mt-56 flex flex-col items-center justify-center">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div className="mt-56 flex flex-col items-center justify-center">
        <h2 className="text-red-500">{error}</h2>
      </div>
    );
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-24 flex flex-col items-center justify-center"
    >
      <div className="flex flex-row items-center justify-center gap-5">
        {pokemon?.map((pokemon) => (
          <motion.div
            key={pokemon.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <Link key={pokemon.name} to={`/pokemon/${pokemon.name}`}>
              <PokemonCard
                key={pokemon.name}
                name={pokemon.name}
                spriteUrl={pokemon.spriteUrl}
                ability={pokemon.ability}
              />
            </Link>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 flex flex-row items-center justify-center">
        <button
          className="flex flex-row rounded-lg bg-zinc-800 px-4 py-3 text-xl text-zinc-300 transition-colors hover:bg-zinc-700 active:bg-zinc-600"
          onClick={handleClick}
        >
          Refresh
          {isLoading && (
            <div className="ml-3">
              <Loading />
            </div>
          )}
        </button>
      </div>
    </motion.div>
  );
}
