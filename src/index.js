import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const elements = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  btnLoadMore: document.querySelector('.load-more'),
};

elements.btnLoadMore.classList.add('is-hidden');

elements.searchForm.addEventListener('submit', handlerSubmit);
elements.btnLoadMore.addEventListener('click', onClickLoadMore);

let newSearchQuery = '';
let lightbox = new SimpleLightbox('.gallery a');
let page = 1;
const perPage = 40;

async function handlerSubmit(evt) {
  evt.preventDefault();
  elements.btnLoadMore.classList.add('is-hidden');
  const form = evt.currentTarget;
  newSearchQuery = form.searchQuery.value.trim();
  if (newSearchQuery === '') {
    iziToast.info({
      message: 'Please write something...',
      position: 'topRight',
      color: 'rgba(57, 58, 58, 0.959);',
    });
    return;
  }

  elements.gallery.innerHTML = '';
  elements.searchForm.reset();
  page = 1;

  try {
    const { hits, totalHits } = await apiService(newSearchQuery, page, perPage);
    if (totalHits === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query.Please try again.',
        position: 'topRight',
      });

      elements.searchForm.reset();
      elements.btnLoadMore.classList.add('is-hidden');
      elements.gallery.innerHTML = '';

      return;
    }

    elements.gallery.innerHTML = '';
    if (totalHits < perPage) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'bottomCenter',
        color: 'rgba(57, 58, 58, 0.959);',
      });
    }
    if (totalHits > perPage) {
      elements.btnLoadMore.classList.remove('is-hidden');
    }
    elements.gallery.innerHTML = '';
    galleryMarkup(hits);
    lightbox.refresh();
    iziToast.success({
      message: `Hooray! We found ${totalHits} images !!!`,
      position: 'topRight',
      color: 'hsl(26, 83%, 56%)',
    });
  } catch (error) {
    console.log(error);
  }
}
axios.defaults.baseURL = 'https://pixabay.com/api/';
const API_KEY = '38012427-abdef302c1869514a7af9c6c2';

async function apiService(newSearchQuery, page, perPage) {
  const { data } = await axios.get(
    `?key=${API_KEY}&q=${newSearchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`
  );
  return data;
}

function galleryMarkup(arr) {
  let markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="gallery-item list">
        <a href="${largeImageURL}">
          <img class="img-item" src="${webformatURL}" alt="${tags}" width=600px />
        </a>
        <div class="info">
          <p class="info-item"><b class="accent">likes:</b>${likes}</p>
          <p class="info-item"><b class="accent">views:</b>${views}</p>
          <p class="info-item"><b class="accent">comments:</b>${comments}</p>
          <p class="info-item"><b class="accent">downloads:</b>${downloads}</p>
        </div>
      </li>`;
      }
    )
    .join('');
  elements.gallery.insertAdjacentHTML('beforeend', markup);
}

async function onClickLoadMore() {
  page += 1;
  try {
    const { hits, totalHits } = await apiService(newSearchQuery, page, perPage);
    galleryMarkup(hits);
    lightbox.refresh();
    const totalPages = Math.ceil(totalHits / perPage);
    if (page === totalPages) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'bottomCenter',
        color: 'rgba(57, 58, 58, 0.959);',
      });
      elements.btnLoadMore.classList.add('is-hidden');
    }
  } catch (error) {
    console.log(error);
  }
}
