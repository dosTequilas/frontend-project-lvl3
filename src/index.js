import 'bootstrap/dist/css/bootstrap.min.css';
// import _ from 'lodash';
import i18next from 'i18next';
import * as yup from 'yup';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import watch from './view.js';
import en from './lang/en.js';
import ru from './lang/ru.js';
import yupLocale from './lang/yup.js';
import parse from './parser.js';
import findNewValue from './arrayDifferenceFinder.js';

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
      feeds: [],
      latestFeeds: [],
      currentPostId: '',
      openedPost: new Set(),
    };

    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('input'),
      button: document.querySelector('button'),
      feedback: document.querySelector('.feedback'),
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalClose: document.querySelector('.modal-close'),
      modalMore: document.querySelector('.more-link'),
      postLink: document.getElementsByTagName('a'),
    };

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
        parsedResponce.id = uuidv4();
        parsedResponce.posts = parsedResponce.posts.map((item) => {
          item.id = uuidv4();
          return item;
        });
        parsedResponce.link = link;
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

    elements.posts.addEventListener('click', (e) => { // один обработчик на все посты?
      console.log(e);
      if (e.target?.dataset?.toggle === 'modal') {
        watchedState.currentPostId = e.target.dataset.id;
        watchedState.openedPost.add(e.target.dataset.id);
      }
      if (e.target.tagName === 'A') {
        watchedState.openedPost.add(e.target.dataset.id);
      }
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();// чтобы не отправлял запрос сразу
      const data = new FormData(e.target);// чтобы получить доступ к введенным данным
      const inputValue = data.get('url');// сами данные
      watchedState.form.status = 'processing';
      const links = watchedState.userEnteredLink;

      validateUrl(inputValue, links)
        .then(() => makeRequest(inputValue)
          .catch((error) => {
            throw error;
          }))

        .catch((err) => {
          if (err.name === 'ValidationError') {
            watchedState.form.status = 'failed';
            watchedState.form.error = err.type;
          } else if (err.name === 'AxiosError') {
            watchedState.loadingProcess.status = 'failed';
            watchedState.loadingProcess.error = 'network';
          } else if (err.name === 'isParsingError') {
            watchedState.loadingProcess.status = 'failed';
            watchedState.loadingProcess.error = 'parsedError';
          }
        });
    });

    const generatePromises = (state) => {
      const promises = state.feeds.map((feed, i) => axios.get(getUrlWithProxy(feed.link))
        .then((resp) => {
          const feedsCopy = JSON.parse(JSON.stringify(state.feeds));
          const parsedResponce = parse(resp.data.contents); // leetcode - структуры данных
          const oldArr = feedsCopy.find((item) => item.id === feed.id).posts;
          const newArr = parsedResponce.posts;
          const newPosts = findNewValue(oldArr, newArr);
          feedsCopy[i].posts = [...oldArr, ...newPosts];
          if (newPosts) {
            // eslint-disable-next-line no-param-reassign
            state.feeds = [...feedsCopy];
          }
        })
        .catch((error) => console.log(error)));
      Promise.all(promises).then(() => {
        setTimeout(() => {
          generatePromises(state);
        }, 5000);
      });

      return promises;
    };
    generatePromises(watchedState);
  });
};

app();
