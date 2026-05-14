import { createContext, useState, useContext, ReactNode, useCallback } from "react";

export interface SearchState {
  vibeText: string;
  diagnosis: string | null;
  recommendedSport: string | null;
  latitude: number | null;
  longitude: number | null;
  userCity: string | null;
  userAddress: string | null;
  isLocationGps: boolean | null;
}

interface SearchContextType {
  searchState: SearchState;
  updateSearchState: (updates: Partial<SearchState>) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [searchState, setSearchState] = useState<SearchState>({
    vibeText: "",
    diagnosis: null,
    recommendedSport: null,
    latitude: null,
    longitude: null,
    userCity: null,
    userAddress: null,
    isLocationGps: null,
  });

  const updateSearchState = useCallback((updates: Partial<SearchState>) => {
    setSearchState((prev) => ({ ...prev, ...updates }));
  }, []);

  return (
    <SearchContext.Provider value={{ searchState, updateSearchState }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
}
