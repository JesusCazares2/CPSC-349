import { useState, useEffect, use } from "react";
import './App.css';

const apiKey = process.env.REACT_APP_API_KEY;
const apiURL = 'https://api.themoviedb.org/3/movie/popular';

export default function App() {
  const [movies, setMovies] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [isSorting, setIsSorting] = useState(false);
  const [currenSort, setCurrentSort] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");

  let searchTimeout;

  useEffect(() => {
    if(isSearching){
      fetchMoviesBySearch(query, currentPage);
    } else if (isSorting) {
      fetchMoviesBySort(currenSort, currentPage);
    } else {
      fetchMoviesByPage(currentPage);
    }
  }, [currentPage]);

  const fetchMoviesByPage = async (page) => {
    try {
      setError("");
      const response = await fetch(
        `${apiURL}?api_key=${apiKey}&language=en-US&page=${page}`
      );
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
      setError("Error: " + err.message);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const fetchMoviesBySearch = async (searchQuery, page = 1) => {
    try {
      setError("");
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}&language=en-US&page=${page}`
      );
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch (err) {
      console.error(err);
      setError("Error: " + err.message);
    }
  };

  const handleInput = (e) => {
    const value = e.target.value;
    setQuery(value);
    setIsSearching(value !== "");

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if(value === "") {
        setIsSearching(false);
        setCurrentPage(1);
        fetchMoviesByPage(1);
      } else {
        setCurrentPage(1);
        fetchMoviesBySearch(value, 1);
      }
    }, 500);
  };

  const fetchMoviesBySort = async (sortBy, page = 1) => {
    try {
      setError("");
      const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${apiKey}&include_adult=false&include_video=false&language=en-US&page=${page}&sort_by=${sortBy}`
      );
      const data = await response.json();
      setMovies(data.results);
      setTotalPages(data.total_pages);
    } catch(err) {
      console.error(err);
      setError("Error: " + err.message);
    }
  };

  const handleMenuInput = (e) => {
    const menuValue = e.target.value;
    setCurrentSort(menuValue);
    setIsSorting(menuValue !== "");

    if(menuValue === "") {
      setIsSorting(false);
      setCurrentPage(1);
      fetchMoviesByPage(1);
    } else {
      setCurrentPage(1);
      fetchMoviesBySort(menuValue, 1);
    }
  };


  return (
    <div className="App">
      <div className="page-title">
        <h1>Movie Explorer</h1>
      </div>

      
      <div className="search-container">
        <input type="text" placeholder="Search for a movie..." value={query} onChange={handleInput} />
        
        <div id="search-dropdown">
          <select name="sort-menu" id="sort-menu" onChange={handleMenuInput}>
            <option value="">Sort By</option>
            <option value="primary_release_date.asc">Release Date(Asc)</option>
            <option value="primary_release_date.desc">Release Date(Desc)</option>
            <option value="vote_average.asc">Rating(Asc)</option>
            <option value="vote_average.desc">Rating(Desc)</option>
          </select>
        </div>
      </div>
      
      <div id="movie-list">
        {error && <p>{error}</p>}
        {movies.length === 0 ? (
          <p>Loading</p>
        ) : (
          movies.map((movie) => (
            <div className="movie-frame" key={movie.id}>
              <img src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`} alt={movie.title} />
              <h1>{movie.title}</h1>
              <p>Release Date: {movie.release_date}</p>
              <p>Rating: {movie.vote_average}</p>
            </div>
          ))
        )}
      </div>

      <div className="page-info">
        <button onClick={handlePreviousPage} disabled={currentPage === 1}>Previous</button>
        <div id="page-number">Page {currentPage} of {totalPages}</div>
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>Next</button>
      </div>
    </div>
  );
}

