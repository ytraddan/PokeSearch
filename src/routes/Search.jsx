import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import pokemonList from "../assets/pokeApiPokemons.json";
import SearchBar from "../components/SearchBar";
import PokemonGrid from "../components/PokemonGrid";
import LoadingGrid from "../components/LoadingGrid";
import TypesRow from "../components/TypesRow";
import PageTransition from "../components/PageTransition";
import ErrorMessage from "../components/ErrorMessage";
import GoTopButton from "../components/GoTopButton";

const allPokemonNames = pokemonList.results.map(({ name }) => name);

// Get pokemons by name
const fetchPokemons = async (names, offset = 0) => {
  console.log("fetching pokemons");
  const pokemonPromises = names.slice(offset, offset + 12).map(async (name) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch pokemon ${name}: ${error.message}`);
    }
  });
  const pokemonsData = await Promise.all(pokemonPromises);
  return pokemonsData.map((pokemon) => {
    return {
      name: pokemon.name,
      id: pokemon.id,
      img: pokemon.sprites.other["official-artwork"].front_default,
    };
  });
};

// Get name arrays from types
const fetchNamesByType = async (types) => {
  console.log("fetching names by type");
  const typePromises = types.map(async (type) => {
    try {
      const response = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch type ${type}: ${error.message}`);
    }
  });
  const typesData = await Promise.all(typePromises);
  const typesPokemon = typesData.map((type) => type.pokemon);
  const pokemonNamesByTypes = typesPokemon.map((pokemon) =>
    pokemon.map((el) => el.pokemon.name),
  );
  return pokemonNamesByTypes;
};

export default function Search() {
  const [pokemons, setPokemons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 250);
  const [types, setTypes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [filteredNames, setFilteredNames] = useState([]);

  // Restore search term and types
  useEffect(() => {
    const searchTerm = localStorage.getItem("searchTerm");
    const types = JSON.parse(localStorage.getItem("types"));
    if (searchTerm) {
      setSearchTerm(searchTerm);
    }
    if (types) {
      setTypes(types);
    }
  }, []);

  // Set searchTerm
  const handleSearchChange = (e) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    localStorage.setItem("searchTerm", searchTerm);
  };

  // Toggle types
  const handleTypeToggle = (type) => {
    if (types.includes(type)) {
      const newTypes = types.filter((t) => t !== type);
      setTypes(newTypes);
      localStorage.setItem("types", JSON.stringify(newTypes));
    } else {
      setTypes([...types, type]);
      localStorage.setItem("types", JSON.stringify([...types, type]));
    }
  };

  // Clear types
  const clearTypes = () => {
    if (types.length < 1) return;
    setTypes([]);
    localStorage.setItem("types", JSON.stringify([]));
  };

  // Get common names in arrays
  const findCommonNames = (namesArrs) => {
    if (namesArrs.length === 0) return [];
    return namesArrs[0].filter((item) =>
      namesArrs.every((arr) => arr.includes(item)),
    );
  };

  // Add new scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (!hasMore || isLoading) return;

      const scrolledToBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 100;

      if (scrolledToBottom) {
        setOffset((prev) => prev + 12);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, isLoading]);

  useEffect(() => {
    setError(null);
    let ignore = false;

    const filterBySearchTerm = (names) => {
      if (names.length === 0) return [];
      return names.filter((name) =>
        name.startsWith(debouncedSearchTerm.toLowerCase()),
      );
    };

    const getFilteredNames = async () => {
      setIsLoading(true);
      setOffset(0);

      try {
        let filteredNames;
        if (types.length) {
          const pokemonNamesByTypes = await fetchNamesByType(types);
          const commonNames = findCommonNames(pokemonNamesByTypes);
          filteredNames = filterBySearchTerm(commonNames);
        } else {
          filteredNames = filterBySearchTerm(allPokemonNames);
        }

        if (!ignore) {
          setFilteredNames(filteredNames);
        }
      } catch (error) {
        if (!ignore) {
          setError(error);
        }
      }
    };

    getFilteredNames();
    return () => {
      ignore = true;
    };
  }, [debouncedSearchTerm, types]);

  useEffect(() => {
    let ignore = false;
    setIsLoading(true);

    const loadPokemons = async () => {
      try {
        const newPokemons = await fetchPokemons(filteredNames, offset);
        if (!ignore) {
          setPokemons((prev) =>
            offset === 0 ? newPokemons : [...prev, ...newPokemons],
          );
          setHasMore(filteredNames.length > offset + 12);
          setIsLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          setError(error);
          setIsLoading(false);
        }
      }
    };

    loadPokemons();
    return () => {
      ignore = true;
    };
  }, [filteredNames, offset]);

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load pokemon data"
        message={error.message}
      />
    );
  }

  return (
    <PageTransition>
      <div className="mx-auto mt-10 w-11/12 lg:w-4/5 xl:w-3/4 2xl:w-7/12">
        <TypesRow
          selectedTypes={types}
          handleTypeToggle={handleTypeToggle}
          clearTypes={clearTypes}
        />
        <SearchBar handleChange={handleSearchChange} searchTerm={searchTerm} />
        {isLoading && offset === 0 ? (
          <div className="mt-5">
            <LoadingGrid items={12} />
          </div>
        ) : (
          <>
            <PokemonGrid pokemons={pokemons} />
            {isLoading && offset > 0 && <LoadingGrid items={8} />}
          </>
        )}
        <GoTopButton />
      </div>
    </PageTransition>
  );
}
