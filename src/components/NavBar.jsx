import NavBarLink from "./NavBarLink";

export default function NavBar() {
  return (
    <nav className="mx-auto mt-4 min-w-full max-w-2xl px-4 sm:min-w-fit">
      <div className="rounded-2xl border-2 border-zinc-700 bg-zinc-800/40 backdrop-blur-sm">
        <ul className="flex items-center justify-evenly gap-2 py-4 px-3">
          <NavBarLink link="/">
            📝<span className="hidden sm:inline">About</span>
          </NavBarLink>
          <div className="block h-6 w-px bg-zinc-700" />
          <NavBarLink link="/search">
            🔍<span className="hidden sm:inline">Search</span>
          </NavBarLink>
          <div className="block h-6 w-px bg-zinc-700" />
          <NavBarLink link="/compare">
            📊<span className="hidden sm:inline">Compare</span>
          </NavBarLink>
          <div className="block h-6 w-px bg-zinc-700" />
          <NavBarLink link="/random">
            🎲<span className="hidden sm:inline">Random</span>
          </NavBarLink>
        </ul>
      </div>
    </nav>
  );
}
