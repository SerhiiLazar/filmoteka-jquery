$(function () {
  handleMovies("");

  displayQueueLibrary();

  handleNewPlaying();

  $(".slider").on("click", ".slider__slide", function (e) {
    e.preventDefault();
    const target = $(e.currentTarget);
    const movie_id = target.data("id");

    fetchMoviesByIdToPlayer(movie_id)
      .then(function (videos) {
        if (videos.length > 0) {
          const name = "Official Trailer";
          const officialTrailer = videos.find(video => video.name === name);
          if (officialTrailer) {
            $("#player").removeClass("is-hidden");
            const videoId = officialTrailer.key;
            showModalPlayer(videoId);
          } else if (!officialTrailer) {
            $("#player").removeClass("is-hidden");
            const videoId = videos[0].key;
            showModalPlayer(videoId);
          } else {
            console.error(`No video found with the name "${name}".`);
          }
        } else {
          console.error("No videos found for this movie.");
        }
      })
      .catch(function (error) {
        console.error("Error fetching movie details:", error);
      });
  });

  $("#form-search").on("submit", function (e) {
    e.preventDefault();
    const query = $("#searchInput").val();
    handleMovies(query);
  });

  //SEARCH ONE FILMS FROM ID
  $("#imageResults").on("click", "li", function (e) {
    e.preventDefault();

    const movieId = $(this).data("id");
    fetchMoviesById(movieId)
      .then(function (movie) {
        movieDetails = movie;
        $("#modal").removeClass("is-hidden");
        $(document).on("keydown", modalKeydownHandler);

        showModal(movie);

        const savedMovieWatched = getMovieWatchedFromLocalStorage(movieId);
        const savedMovieQueue = getMovieQueueFromLocalStorage(movieId);
        if (savedMovieWatched) {
          $("#watched")
            .text("REMOVE FROM WATCHED")
            .addClass("modal__btn--active");
        } else {
          $("#watched")
            .text("ADD TO WATCHED")
            .removeClass("modal__btn--active");
        }

        if (savedMovieQueue) {
          $("#queue").text("REMOVE FROM QUEUE").addClass("modal__btn--active");
        } else {
          $("#queue").text("ADD TO QUEUE").removeClass("modal__btn--active");
        }

        $("#watched")
          .off("click")
          .on("click", function () {
            const savedMovie = getMovieWatchedFromLocalStorage(movieId);
            if (savedMovie) {
              removeMovieWatchedFromLocalStorage(movieId);
              $(this).text("ADD TO WATCHED").removeClass("modal__btn--active");
            } else {
              addMovieWatchedToLocalStorage(movie);
              $(this)
                .text("REMOVE FROM WATCHED")
                .addClass("modal__btn--active");
            }
          });

        $("#queue")
          .off("click")
          .on("click", function () {
            const savedMovie = getMovieQueueFromLocalStorage(movieId);
            if (savedMovie) {
              removeMovieQueueFromLocalStorage(movieId);
              $(this).text("ADD TO QUEUE").removeClass("modal__btn--active");
            } else {
              addMovieQueueToLocalStorage(movie);
              $(this).text("REMOVE FROM QUEUE").addClass("modal__btn--active");
            }
          });
      })
      .catch(function (error) {
        console.error("Error fetching movie details:", error);
      });
  });
  //CLOSE MODAL-PLAYER
  $("[data-modalPlayer-close]").on("click", function (e) {
    $("#modalPlayer").addClass("is-hidden");
  });

  $(".backdrop-player").on("click", function (e) {
    if ($(e.target).is(".backdrop-player")) {
      $("#modalPlayer").addClass("is-hidden");
    }
  });

  //CLOSE MODAL
  $("[data-modal-close]").on("click", function (e) {
    $("#modal").addClass("is-hidden");
  });

  $(".backdrop").on("click", function (e) {
    if ($(e.target).is(".backdrop")) {
      $("#modal").addClass("is-hidden");
    }
  });

  $("#modal").on("hidden.bs.modal", function () {
    const activeTab = $(".btn_is-active").attr("id");
    if (activeTab === "queue-lib") {
      displayQueueLibrary();
    } else {
      displayWatchedLibrary();
    }
  });

  //BUTTON FROM LIBRARY
  $("#watched-lib").on("click", function () {
    $(".pagination").hide();
    displayWatchedLibrary();
  });

  $("#queue-lib").on("click", function () {
    $(".pagination").hide();
    displayQueueLibrary();
  });

  // Обработчик нажатия на элемент списка фильмов
  $("#imageResultsLib").on("click", "li", function (e) {
    const movieId = $(this).data("id");
    fetchMoviesById(movieId)
      .then(function (movie) {
        movieDetails = movie;
        $("#modal").removeClass("is-hidden");
        $(document).on("keydown", modalKeydownHandler);
        showModal(movie);

        const savedMovieWatched = getMovieWatchedFromLocalStorage(movieId);
        const savedMovieQueue = getMovieQueueFromLocalStorage(movieId);

        if (savedMovieWatched) {
          $("#watched")
            .text("REMOVE FROM WATCHED")
            .addClass("modal__btn--active");
        } else {
          $("#watched")
            .text("ADD TO WATCHED")
            .removeClass("modal__btn--active");
        }

        if (savedMovieQueue) {
          $("#queue").text("REMOVE FROM QUEUE").addClass("modal__btn--active");
        } else {
          $("#queue").text("ADD TO QUEUE").removeClass("modal__btn--active");
        }

        $("#watched")
          .off("click")
          .on("click", function () {
            const savedMovie = getMovieWatchedFromLocalStorage(movieId);
            if (savedMovie) {
              removeMovieWatchedFromLocalStorage(movieId);
              $(this).text("ADD TO WATCHED").removeClass("modal__btn--active");
              $(`#imageResultsLib li[data-id='${movieId}']`).remove();
              displayWatchedLibrary();
              $("#modal").addClass("is-hidden");
            } else {
              addMovieWatchedToLocalStorage(movie);
              $(this)
                .text("REMOVE FROM WATCHED")
                .addClass("modal__btn--active");
            }
          });

        $("#queue")
          .off("click")
          .on("click", function () {
            const savedMovie = getMovieQueueFromLocalStorage(movieId);
            if (savedMovie) {
              removeMovieQueueFromLocalStorage(movieId);
              $(this).text("ADD TO QUEUE").removeClass("modal__btn--active");
              $(`#imageResultsLib li[data-id='${movieId}']`).remove();
              displayQueueLibrary();
              $("#modal").addClass("is-hidden");
            } else {
              addMovieQueueToLocalStorage(movie);
              $(this).text("REMOVE FROM QUEUE").addClass("modal__btn--active");
            }
          });
      })
      .catch(function (error) {
        console.error("Error fetching movie details:", error);
      });
  });

  // BUTTON PAGINATION
  $.each($prevNext, function (_, button) {
    $(button).on("click", function (e) {
      currentStep += $(this).attr("id") === "next" ? 1 : -1;
      generatePaginationLinks();
      updateBtn();
      handleMovies(currentQuery, currentStep + 1);
    });
  });

  $startBtn.on("click", function () {
    currentStep = 0;
    generatePaginationLinks();
    updateBtn();
    handleMovies(currentQuery, currentStep + 1);
  });

  $endBtn.on("click", function () {
    currentStep = totalPages - 1;
    generatePaginationLinks();
    updateBtn();
    handleMovies(currentQuery, currentStep + 1);
  });
});

const BASE_URL = process.env.BASE_URL;
const IMAGE_BASE_URL = process.env.IMAGE_BASE_URL;
const IMAGE_BASE_URL_ORIGINAL = process.env.IMAGE_BASE_URL_ORIGINAL;
const API_KEY = process.env.API_KEY;
const BEARER_TOKEN = process.env.BEARER_TOKEN;

let totalPages = 0;
let trendingTotalPages = 0;
let searchTotalPages = 0;
let currentStep = 0;
let maxPagesToShow;
let movieDetails = null;
let movieDetailsPlayer = null;
let page = 1;
let currentQuery = "";
let genres = [];

//SEARCH GENRES FROM API
function fetchGenres() {
  let deferred = $.Deferred();
  $.ajax({
    url: `${BASE_URL}genre/movie/list?language=en`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`
    },
    success: function (response) {
      genres = response.genres.reduce((acc, genre) => {
        acc[genre.id] = genre.name;

        return acc;
      }, {});
      deferred.resolve();
    },
    error: function (error) {
      console.error("Error fetching genres: ", error);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

//SEARCH MOVIES FROM API
function fetchMovies(page, totalPages) {
  let deferred = $.Deferred();
  $("#spinner").removeAttr("hidden");
  $.ajax({
    url: `${BASE_URL}trending/movie/day?language=en`,
    method: "GET",
    data: {
      api_key: API_KEY,
      page: page
    },
    success: function (response) {
      $("#spinner").attr("hidden", true);
      deferred.resolve({
        movies: response.results,
        totalPages: response.total_pages
      });
    },
    error: function (error) {
      console.error("Error fetching movies: ", error);
      $("#spinner").attr("hidden", true);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

function searchMovies(query, page) {
  let deferred = $.Deferred();
  $("#spinner").removeAttr("hidden");

  $.ajax({
    url: `${BASE_URL}search/movie?include_adult=true&language=en-US`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`
    },
    data: {
      api_key: API_KEY,
      page: page,
      query: query
    },
    success: function (response) {
      $("#spinner").attr("hidden", true);
      deferred.resolve({
        movies: response.results,
        totalPages: response.total_pages
      });
    },
    error: function (error) {
      console.error("Error fetching movies: ", error);
      $("#spinner").attr("hidden", true);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

function nowPlaying() {
  let deferred = $.Deferred();

  $("#spinner").removeAttr("hidden");
  $.ajax({
    url: `${BASE_URL}trending/movie/day?language=en`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`
    },
    data: {
      api_key: API_KEY
    },
    success: function (response) {
      $("#spinner").attr("hidden", true);
      deferred.resolve(response.results);
    },
    error: function (error) {
      console.error("Error fetching nowPlaying: ", error);
      $("#spinner").attr("hidden", true);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

//GET GENRE AND SEARCH GENRE FROM ID IN MOVIE API
function getGenreNames(genreIds) {
  return genreIds
    .map(id => genres[id])
    .filter(name => name)
    .join(", ");
}

function handleMovies(query, page) {
  const currentUrl = window.location.pathname;

  if (!currentUrl.endsWith("/") && !currentUrl.includes("index.html")) {
    $(".pagination").hide();
    return;
  }
  if (typeof page === "undefined") {
    page = 1;
  }
  currentQuery = query;
  $("#spinner").removeAttr("hidden");
  fetchGenres()
    .then(function () {
      if (query.trim() === "") {
        return fetchMovies(page);
      } else {
        return searchMovies(query, page);
      }
    })
    .then(function (result) {
      if (query.trim() === "") {
        trendingTotalPages = result.totalPages;
      } else {
        searchTotalPages = result.totalPages;
      }
      renderMovies(result.movies);

      totalPages = query.trim() === "" ? trendingTotalPages : searchTotalPages; // Обновляем totalPages в зависимости от запроса
      currentStep = page - 1;

      updateBtn();
      generatePaginationLinks();

      $("#spinner").attr("hidden", true);
    })
    .catch(function (error) {
      console.error("Error fetching genres or movies:", error);
      $("#spinner").attr("hidden", true);
    });
}

function handleNewPlaying() {
  $("#spinner").removeAttr("hidden");
  fetchGenres()
    .then(function () {
      return nowPlaying();
    })
    .then(function (movies) {
      renderSlides(movies);
      $("#spinner").attr("hidden", true);
    })
    .catch(function (error) {
      console.error("Error fetching genres or movies:", error);
      $("#spinner").attr("hidden", true);
    });
}

//SEARCH MOVIE BY ID FROM API
function fetchMoviesById(movieId) {
  let deferred = $.Deferred();
  $.ajax({
    url: `${BASE_URL}movie/${movieId}`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`
    },
    success: function (response) {
      deferred.resolve(response);
    },
    error: function (error) {
      console.error("Error fetching movie details: ", error);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

function fetchMoviesByIdToPlayer(id) {
  let deferred = $.Deferred();
  $.ajax({
    url: `${BASE_URL}/movie/${id}/videos`,
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${BEARER_TOKEN}`
    },
    success: function (response) {
      if (response.results && response.results.length > 0) {
        deferred.resolve(response.results); // Вернем массив с видео
      } else {
        console.error("No videos found in the API response.");
        deferred.resolve([]); // Возвращаем пустой массив
      }
    },
    error: function (error) {
      console.error("Error fetching movie details: ", error);
      deferred.reject(error);
    }
  });
  return deferred.promise();
}

//MOVIE CARD TO HOME PAGE
function renderMovies(movies) {
  const movieResults = $("#imageResults");
  movieResults.empty();

  $.each(movies, function (_, movie) {
    const imageURL = IMAGE_BASE_URL_ORIGINAL + movie.poster_path;
    let movieGenreNames = getGenreNames(movie.genre_ids);
    const releaseDate = movie.release_date;
    const firstAirDate = movie.first_air_date;
    const movieId = movie.id;
    const randomDate = "2021";
    const movieYear = releaseDate || firstAirDate || randomDate;
    const altText = movie.title || movie.name;
    let genreNamesArray = movieGenreNames.split(", ");

    if (genreNamesArray.length > 2) {
      genreNamesArray = genreNamesArray.slice(0, 2);
      genreNamesArray.push("Other...");
      movieGenreNames = genreNamesArray.join(", ");
    } else if (genreNamesArray.length === 0) {
      genreNamesArray.push("NO GENRES");
      movieGenreNames = genreNamesArray.join();
    }

    const movieElement = $("<img>")
      .addClass("card_image")
      .attr("src", imageURL)
      .attr("loading", "lazy")
      .attr("alt", altText)
      .attr("width", "300");

    const movieTitle = $("<p>")
      .addClass("card_name")
      .text(movie.original_title || movie.original_name);

    const movieGenres = $("<p>")
      .addClass("card_text")
      .text(movieGenreNames + " | " + movieYear.slice(0, 4));

    const listItem = $("<li>")
      .attr("data-id", movieId)
      .addClass("card")
      .append(movieElement)
      .append(movieTitle)
      .append(movieGenres);

    movieResults.append(listItem);
  });
}

//MOVIE CARD TO HOME PAGE
function renderSlides(movies) {
  const movieResults = $(".slider__slides");
  movieResults.empty();

  $.each(movies, function (_, movie) {
    const imageURL = IMAGE_BASE_URL_ORIGINAL + movie.poster_path;
    const movieId = movie.id;
    const altText = movie.title || movie.name;

    const movieElement = $("<img>")
      .addClass("slider__images")
      .attr("src", imageURL)
      .attr("loading", "lazy")
      .attr("alt", altText)
      .attr("width", "300");

    const svgHTML = `
          <svg class="slider__icon" width="100" height="100">
            <use href="./images/dist/sprite.svg#icon-youtube"></use>
          </svg>
        `;

    const listItem = $("<li>")
      .attr("data-id", movieId)
      .addClass("slider__slide")
      .append(movieElement)
      .append(svgHTML);

    movieResults.append(listItem);
  });
  initSlide();
}

function initSlide() {
  let totalSlides = $(".slider__slide").children(".slider__images").length;

  let slidesWindowToShow = $(".slider__slides").width();
  let sliderWidth = $(".slider").width();

  let currentSlides = $(".slider__slide").outerWidth(true);
  let visibleSlides = Math.floor(slidesWindowToShow / currentSlides);
  let translateWidth = 0;
  let currentIndex = 0;
  let maxIndex = totalSlides - visibleSlides;

  $(".slider__next").on("click", function () {
    if (currentIndex < maxIndex) {
      currentIndex += visibleSlides;
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      translateWidth = -currentIndex * $(".slider__slide").outerWidth(true);
      $(".slider__slides").css(
        "transform",
        "translateX(" + translateWidth + "px)"
      );
    }
  });
  $(".slider__prev").on("click", function () {
    if (currentIndex > 0) {
      currentIndex -= visibleSlides;
      if (currentIndex < 0) {
        currentIndex = 0;
      }
      translateWidth = -currentIndex * $(".slider__slide").outerWidth(true);
      $(".slider__slides").css(
        "transform",
        "translateX(" + translateWidth + "px)"
      );
    }
  });
}

//MODAL CARD
function showModal(movie) {
  const modal = $("#modal");
  const movieGenres = movie.genres.map(genre => genre.name).join(", ");
  const altText = movie.title || movie.name;
  $(".modal__image")
    .attr("src", IMAGE_BASE_URL_ORIGINAL + movie.poster_path)
    .attr("loading", "lazy")
    .attr("alt", altText)
    .attr("width", "300");

  $(".modal__title").text(
    movie.name || movie.original_title || movie.original_name
  );
  $("#vote-1").text(movie.vote_average.toFixed(1));
  $("#vote-2").text(movie.vote_count);
  $("#popularity").text(movie.popularity.toFixed(1));
  $(".modal__info-value-title").text(
    movie.name || movie.original_title || movie.original_name
  );
  $("#genres").text(movieGenres);
  $("#about").text(movie.overview);
  modal.show();
}

function showModalPlayer(videoId) {
  const iframeContainer = $("#iframeContainer");
  const iframe = $("#iframePlayer");

  iframe.attr("src", "https://www.youtube.com/embed/" + videoId);

  iframeContainer.removeClass("is-hidden");

  $(window).on("click", function (event) {
    if (
      !$(event.target).closest("#iframePlayer").length &&
      !$(event.target).is("#iframePlayer")
    ) {
      iframe.attr("src", "");
      iframeContainer.addClass("is-hidden");
    }
  });
}

function modalKeydownHandler(e) {
  if (e.which === 27) {
    $("#modal").addClass("is-hidden");
    $(document).off("keydown", modalKeydownHandler);
  }
}

/*BLOCK LOCAL STORAGE */
//SAVE DATA TO LOCAL STORAGE
function saveDataToLocalStorage(key, data) {
  try {
    let jsonData = JSON.stringify(data);
    localStorage.setItem(key, jsonData);
  } catch (error) {
    console.error("Saving info error :", error);
  }
}
//GET FUNCTION FROM LOCAL STORAGE
function getDataFromLocalStorage(key) {
  const jsonData = localStorage.getItem(key);
  return jsonData ? JSON.parse(jsonData) : null;
}
//DELETED FUNCTION FROM LOCAL STORAGE
function removeDataFromLocalStorage(key) {
  localStorage.removeItem(key);
}
//ADD WATCHED TO LOCAL STORAGE
function addMovieWatchedToLocalStorage(movie) {
  let movieId = movie.id;
  let movies = getDataFromLocalStorage("movies-watched") || [];
  if (movieId && !movies.some(m => m.id === movieId)) {
    movies.push(movie);
    saveDataToLocalStorage("movies-watched", movies);
  }
}
//ADD QUEUE TO LOCAL STORAGE
function addMovieQueueToLocalStorage(movie) {
  let movieId = movie.id;
  let movies = getDataFromLocalStorage("movies-queue") || [];
  if (movieId && !movies.some(m => m.id === movieId)) {
    movies.push(movie);
    saveDataToLocalStorage("movies-queue", movies);
  }
}
//GET ALL ARRAY WATCHED FROM LOCAL STORAGE
function getAllMoviesWatchedFromLocalStorage() {
  return getDataFromLocalStorage("movies-watched") || [];
}
//GET ALL ARRAY QUEUE FROM LOCAL STORAGE
function getAllMoviesQueueFromLocalStorage() {
  return getDataFromLocalStorage("movies-queue") || [];
}
//GET WATCHED FROM LOCAL STORAGE
function getMovieWatchedFromLocalStorage(movieId) {
  const movies = getDataFromLocalStorage("movies-watched") || [];
  return movies.some(movie => movie.id === movieId);
}
//GET QUEUE MOVIE FROM LOCAL STORAGE
function getMovieQueueFromLocalStorage(movieId) {
  const movies = getDataFromLocalStorage("movies-queue") || [];
  return movies.some(movie => movie.id === movieId);
}
//DELETED WATCHED FROM LOCAL STORAGE
function removeMovieWatchedFromLocalStorage(movieId) {
  let movies = getDataFromLocalStorage("movies-watched") || [];
  let updatedMovies = movies.filter(movie => movie.id !== movieId);
  saveDataToLocalStorage("movies-watched", updatedMovies);
}
//DELETED QUEUE FROM LOCAL STORAGE
function removeMovieQueueFromLocalStorage(movieId) {
  let movies = getDataFromLocalStorage("movies-queue") || [];
  let updatedMovies = movies.filter(movie => movie.id !== movieId);
  saveDataToLocalStorage("movies-queue", updatedMovies);
}

function renderMovieCard(movie) {
  let genresName = movie.genres.map(genre => genre.name);
  const movieId = movie.id;
  const altText = movie.title || movie.name;
  if (genresName.length > 2) {
    genresName = genresName.slice(0, 2);
    genresName.push("...Other");
  } else if (genresName.length === 0) {
    genresName.push("NO GENRES");
  }
  genresName = genresName.join();

  const movieElement = $("<img>")
    .addClass("card_image")
    .attr("loading", "lazy")
    .attr("src", IMAGE_BASE_URL_ORIGINAL + movie.poster_path)
    .attr("alt", altText)
    .attr("width", "300");

  const movieTitle = $("<p>").addClass("card_name").text(movie.original_title);

  const movieGenres = $("<p>")
    .addClass("card_text")
    .text(genresName + " | " + movie.release_date.slice(0, 4));

  const listItem = $("<li>")
    .attr("data-id", movieId)
    .addClass("card")
    .append(movieElement)
    .append(movieTitle)
    .append(movieGenres);

  $("#imageResultsLib").append(listItem);
}

//My Library Render
function displayWatchedLibrary() {
  let watchedLib = getAllMoviesWatchedFromLocalStorage();
  if (watchedLib && watchedLib.length > 0) {
    $("#library-container").hide();
    $("#library-content").show();
  } else {
    $("#library-content").hide();
    $("#library-container").show();
  }
  $("#imageResultsLib").empty();
  $.each(watchedLib, function (_, movie) {
    renderMovieCard(movie);
  });
  $("#watched-lib").addClass("btn_is-active");
  $("#queue-lib").removeClass("btn_is-active");
  currentQuery = "";
  currentStep = 0;
  totalPages = 0;
  trendingTotalPages = 0;
  searchTotalPages = 0;
  $(".pagination").hide();
}

function displayQueueLibrary() {
  let queueLib = getAllMoviesQueueFromLocalStorage();
  if (queueLib && queueLib.length > 0) {
    $("#library-container").hide();
    $("#library-content").show();
  } else {
    $("#library-content").hide();
    $("#library-container").show();
  }
  $("#imageResultsLib").empty();
  $.each(queueLib, function (_, movie) {
    renderMovieCard(movie);
  });

  $("#queue-lib").addClass("btn_is-active");
  $("#watched-lib").removeClass("btn_is-active");
}
const $startBtn = $("#startBtn");
const $endBtn = $("#endBtn");
const $prevNext = $(".prevNext");
const $linksContainer = $(".pagination__links");

const updateBtn = function () {
  if (currentStep >= totalPages - 1) {
    $endBtn.attr("disabled", true);
    $prevNext.eq(1).attr("disabled", true);
  } else if (currentStep <= 0) {
    $startBtn.attr("disabled", true);
    $prevNext.eq(0).attr("disabled", true);
  } else {
    $endBtn.attr("disabled", false);
    $prevNext.eq(1).attr("disabled", false);
    $startBtn.attr("disabled", false);
    $prevNext.eq(0).attr("disabled", false);
  }
};
if ($(window).width() < 375) {
  maxPagesToShow = 2;
} else if ($(window).width() < 768) {
  maxPagesToShow = 3;
} else {
  maxPagesToShow = 5;
}
const generatePaginationLinks = function () {
  $linksContainer.empty();
  if (totalPages === 1) {
    $(".pagination").empty();
    return;
  }
  let start = Math.max(0, currentStep - Math.floor(maxPagesToShow / 2));
  let end = Math.min(totalPages - 1, start + maxPagesToShow - 1);

  if (end === totalPages - 1) {
    start = Math.max(0, end - maxPagesToShow + 1);
  }

  for (let i = start; i <= end; i++) {
    const $link = $("<a>", {
      href: "#",
      class: "pagination__link",
      text: i + 1
    });

    if (i === currentStep) {
      $link.addClass("active");
    }

    $link.on("click", function (e) {
      e.preventDefault();
      currentStep = i;
      updateBtn();
      generatePaginationLinks();
      handleMovies(currentQuery, currentStep + 1);
    });

    $linksContainer.append($link);
  }
};
