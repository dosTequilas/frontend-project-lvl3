import 'bootstrap/dist/css/bootstrap.min.css';
import i18next, { init } from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import watch from './view.js';
import en from './lang/en.js';
import ru from './lang/ru.js';
import yupLocale from './lang/yup.js';
import parse from './parser.js';

const getUrlWithProxy = (url) => {
  const urlWithProxy = new URL('/get', 'https://allorigins.hexlet.app/get?url=https:%2F%2Fru.hexlet.io%2Flessons.rss');
  urlWithProxy.searchParams.set('url', url);
  urlWithProxy.searchParams.set('disableCache', 'true');
  return urlWithProxy.toString();
};

const app = () => {
  i18next.createInstance().init({
    lng: 'ru',
    debug: true,
    resources: {
      ru,
      en,
    },
  }).then((i18) => {
    yup.setLocale(yupLocale);

    const initialState = {
      name: '',
      userEnteredLink: [],
      form: {
        status: 'idle', // idle, processing, vaild, failed
        error: '',
      },
      loadingProcess: {
        status: 'idle', // idle, loading, success, error
        error: '',
      },
      feeds: [], // состояние загрузки фида - в процессе. Логика парсинга в процесс загрузки
    };

    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('input'),
      button: document.querySelector('button'),
      feedback: document.querySelector('.feedback'),
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
    };

    console.log(elements.button);

    const watchedState = watch(initialState, elements, i18);

    const validateUrl = (url, links) => {
      const schema = yup
        .string()
        .url('notURL')
        .required('required')
        .notOneOf(links, 'exists');
      return schema.validate(url, links);
    };

    const makeRequest = (link) => {
      watchedState.form.status = 'processing';
      return axios.get(getUrlWithProxy(link)).then((resp) => {
        const parsedResponce = parse(resp.data.contents);
        watchedState.feeds.push(parsedResponce);
        watchedState.userEnteredLink.push(link);
        watchedState.loadingProcess = 'success';
        watchedState.form.status = 'valid';
      })
        .catch(() => {
          watchedState.loadingProcess.error = 'network'; // убрать зависимость от порядка строк, мб на появление ошибки, а не стейт
          watchedState.loadingProcess.status = 'error'; // аналогично посмотреть порядок строк, чтобы отрабатывать errors.
        });
    };
    // модальное окно вывести

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();// чтобы не отправлял запрос сразу
      const data = new FormData(e.target);// чтобы получить доступ к введенным данным
      const inputValue = data.get('url');// сами данные
      watchedState.form.status = 'processing';
      const links = watchedState.userEnteredLink;
      // console.log(watchedState);

      validateUrl(inputValue, links)
        .then(() => makeRequest(inputValue)
          .catch((error) => {
            console.log(error);
            throw error;
          }))

        .catch((err) => {
          console.log(err.type);
          if (err.name === 'ValidationError') {
            watchedState.form.status = 'failed';
            watchedState.form.error = err.type;
            // console.log('err.type:', err.type);
            // console.log('err.message:', err.message);
          } else if (err.name === 'AxiosError') {
            watchedState.loadingProcess.status = 'failed';
            watchedState.loadingProcess.error = 'network';
          } else if (err.name === 'isParsingError') {
            watchedState.loadingProcess.status = 'failed';
            watchedState.loadingProcess.error = 'parsedError';
          }
        });
    });

    // функция, которая получает состояние, загружает фиды и создает массив промисов.
    // ( массив ссылок - обойти и вернуть для каждой промис)

    function renderPosts(feed) {
      const container = document.querySelector(`[data-id="${feed.id}"] .card-body`);
      feed.posts.forEach((post) => {
        const postElement = document.createElement('div');
        postElement.innerHTML = `
          <h5 class="card-title">${post.title}</h5>
          <p class="card-text">${post.description}</p>
          <a href="${post.link}" class="btn btn-primary" target="_blank">Read more</a>
        `;
        container.appendChild(postElement);
      });
    }

    setInterval(() => {
      feeds.forEach(async (feed) => {
        const response = await fetch(feed.url);
        const data = await response.text();
        const rss = parser(data);

        rss.items.forEach((item) => {
          const postExists = feed.posts.some((post) => post.link === item.link);
          if (!postExists) {
            feed.posts.push(item);
          }
        });

        renderPosts(feed);
      });
    }, updateInterval);
  });
};

app();
