// меню
const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = 'da89382b37c9a418ca249d8fddb11234';
const SERVER = 'https://api.themoviedb.org/3';


const leftMenu = document.querySelector('.left-menu'),
    hamburger = document.querySelector('.hamburger'),
    tvShowsList = document.querySelector('.tv-shows__list'),
    modal = document.querySelector('.modal'),
    tvShows = document.querySelector('.tv-shows'),
    tvCardImg = document.querySelector('.tv-card__img'),
    modalTitle = document.querySelector('.modal__title'),
    genresList = document.querySelector('.genres-list'),
    rating = document.querySelector('.rating'),
    description = document.querySelector('.description'),
    modalLink = document.querySelector('.modal__link'),
    searchForm = document.querySelector('.search__form'),
    searchFormInput = document.querySelector('.search__form-input');


const loading = document.createElement('div');
loading.className = 'loading';


class DBService {
    getData = async (url) => {
        const res = await fetch(url);
        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Didn't get Data via adress ${url}`);
        }
    };
    getTestData = () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }

    getSearchResult = (query) => {
        return this.getData(`${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU`);
    }

    getTvShow = id => {
        return this.getData(`${SERVER}/tv/${id}?api_key=${API_KEY}&language=ru-RU`);
    }
}


const renderCard = response => {
    console.log(response);
    tvShowsList.textContent = '';

    response.results.forEach(item => {

        const  {
            backdrop_path: backdrop,
            name: title,
            poster_path: poster,
            vote_average: vote,
            id
            } = item;

        const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
        const backdropIMG = backdrop ? IMG_URL + backdrop : '';
        const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : '';

        const card = document.createElement('li');
        card.idTV = id;
        card.classList.add('tv-shows__item');
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${IMG_URL + poster}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    });
};


searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if (value) {
        tvShows.append(loading);
        new DBService().getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
});


// открытие/закрытие меню

hamburger.addEventListener('click', (event) => {
   leftMenu.classList.toggle('openMenu');
   hamburger.classList.toggle('open');
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', (event) => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');
    if (dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');

    }
});


// открытие модального окна

tvShowsList.addEventListener('click', (event) => {

    event.preventDefault();

   const target = event.target;
   const card = target.closest('.tv-card');

   if (card) {

       new DBService().getTvShow(card.id)
           .then(({ poster_path: posterPath, name: title, genres,
                  vote_average: voteAverage, overview, homepage}) => {
               tvCardImg.src = IMG_URL + posterPath;
               tvCardImg.alt = title;
               modalTitle.textContent = title;
               genresList.innerHTML = genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
               rating.textContent = voteAverage;
               description.textContent = overview;
               modalLink.href = homepage;

           })
           .then(() =>  {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
           });



   }
});


//зактытие

modal.addEventListener('click', (event) => {

    console.log(event.target.closest('.cross'));

    if (event.target.closest('.cross') ||
        event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});


// смена карточки

const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');

    if (card) {
        const img = card.querySelector('.tv-card__img');
        if (img.dataset.backdrop) {
            [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
        }
    }
};

tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);