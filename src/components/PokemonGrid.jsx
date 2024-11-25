/* eslint-disable react/prop-types */
import PokemonPreview from "./PokemonPreview";
import { motion } from "motion/react";

export default function PokemonGrid({ pokemons }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="px-4 py-8"
    >
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {pokemons.map((pokemon) => (
          <div
            key={pokemon.name}
          >
            <PokemonPreview pokemon={pokemon} />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
