import SearchFilters from '../SearchFilters';

export default function SearchFiltersExample() {
  return (
    <SearchFilters 
      onSearch={(filters) => console.log('Search filters applied:', filters)} 
    />
  );
}