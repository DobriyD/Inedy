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
    searchFormInput = document.querySelector('.search__form-input'),
    preloader = document.querySelector('.preloader'),
    dropdown = document.querySelectorAll('.dropdown'),
    tvShowsHead = document.querySelector('.tv-shows__head'),
    posterWrapper = document.querySelector('.poster__wrapper'),
    modalContent = document.querySelector('.modal__content'),
    pagination = document.querySelector('.pagination');


const loading = document.createElement('div');
loading.className = 'loading';


const DBService = class {
    getData = async (url) => {
        tvShows.append(loading);
        const res = await fetch(url);

        if (res.ok) {
            return res.json();
        } else {
            throw new Error(`Didn't get Data via adress ${url}`);
        }
    };

    getTestData = () => {
        return this.getData('test.json');
    };

    getTestCard = () => {
        return this.getData('card.json');
    };

    getSearchResult = query => {
        this.temp = `${SERVER}/search/tv?api_key=${API_KEY}&query=${query}&language=ru-RU}`;
        return this.getData(this.temp)
    };

    getNextPage = page => {
        return this.getData(this.temp + '&page' + page)
    };

    getTvShow = id => this.getData (SERVER + '/tv/' + id + '?api_key=' + API_KEY + '&language=ru-RU');

    getTopRated = () => this.getData(`${SERVER}/tv/top_rated?api_key=${API_KEY}&language=ru-RU`);

    getPopular = () => this.getData(`${SERVER}/tv/popular?api_key=${API_KEY}&language=ru-RU`);

    getToday = () => this.getData(`${SERVER}/tv/airing_today?api_key=${API_KEY}&language=ru-RU`);

    getWeek = () => this.getData(`${SERVER}/tv/on_the_air?api_key=${API_KEY}&language=ru-RU`);
}

dbService = new DBService();


const renderCard = (response, target) => {
    tvShowsList.textContent = '';

    if (!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'Sadly, but we have found nothing :(';
        tvShowsHead.style.cssText = 'red';
        return;
    }

    tvShowsHead.textContent = target ? target.textContent : 'Search result:';
    tvShowsHead.style.cssText = 'black';

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
                    src="${posterIMG}"
                    data-backdrop="${backdropIMG}"
                    alt="${title}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowsList.append(card);
    });

    pagination.textContent = '';

    if (!target && response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a>></li>>`
        }
    }
};


searchForm.addEventListener('submit', event => {
    event.preventDefault();

    const value = searchFormInput.value.trim();
    if (value) {
        // tvShows.append(loading);
        dbService.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
});


// открытие/закрытие меню

const closeDropDown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
};

hamburger.addEventListener('click', (event) => {
   leftMenu.classList.toggle('openMenu');
   hamburger.classList.toggle('open');
   closeDropDown();
});

document.addEventListener('click', (event) => {
    if (!event.target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
        closeDropDown();
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

    if (target.closest('#top-rated')) {
        dbService.getTopRated().then((response) => renderCard(response, target));
    }

    if (target.closest('#popular')) {
        dbService.getPopular().then((response) => renderCard(response, target));
    }

    if (target.closest('#week')) {
        dbService.getWeek().then((response) => renderCard(response, target));
    }

    if (target.closest('#today')) {
        dbService.getToday().then((response) => renderCard(response, target));
    }

    if (target.closest('#search')) {
        tvShowsList.textContent = '';
        tvShowsHead.textContent = '';
    }
});


// открытие модального окна

tvShowsList.addEventListener('click', event => {
    event.preventDefault();

    const target = event.target;
    const card = target.closest('.tv-card');

    if (card) {
        tvShows.append(loading);
       // preloader.style.display = 'block';

        dbService.getTvShow(card.id)
            .then(response => {
                if (response.poster) {
                    tvCardImg.src = IMG_URL + response.poster;
                    tvCardImg.alt = response.name;
                    posterWrapper.style.display= '';
                    modalContent.style.paddingLeft = '';
                } else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px';
                }

                modalTitle.textContent = response.name;
                genresList.textContent = ``;
                for(const item of response.genres){genresList.innerHTML += `<li>${item.name}</li>`};
                rating.textContent = response.vote_average;
                description.textContent = response.overview;
                modalLink.href =  response.homepage;

            })
            .then(() =>  {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })

            .finally(() => {
                // preloader.style.display = '';
                loading.remove();
       })


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

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;

    if (target.classList.contains('pages')) {
        dbService.getNextPage(target.textContent).then(renderCard);
    }
});