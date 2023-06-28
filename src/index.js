import 'bootstrap/dist/css/bootstrap.min.css';
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
        status: 'idle',
        error: '',
      },
      loadingProcess: {
        status: 'idle',
        error: '',
      },
      feeds: [],
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
      postLink: document.getElementsByTagName('a'),
      modalTitle: document.querySelector('.modal-title'),
      modalBody: document.querySelector('.modal-body'),
      modalClose: document.querySelector('.modal-close'),
      modalMore: document.querySelector('.more-link'),
      pageName: document.getElementById('pageName'),
      pageMoto: document.getElementById('pageMoto'),
      pageInput: document.getElementById('pageInput'),
      pageInputButton: document.getElementById('pageInputButton'),
      pageExample: document.getElementById('pageExample'),
      pageCreated: document.getElementById('pageCreated'),
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
        parsedResponce.posts = parsedResponce.posts.map((item) => ({
          ...item,
          id: uuidv4(),
        }));
        parsedResponce.link = link;
        watchedState.feeds.push(parsedResponce);
        watchedState.userEnteredLink.push(link);
        watchedState.loadingProcess.status = 'success';
        watchedState.form.status = 'valid';
      });
    };

    elements.posts.addEventListener('click', (e) => {
      if (e.target?.dataset?.toggle === 'modal') {
        watchedState.currentPostId = e.target.dataset.id;
        watchedState.openedPost.add(e.target.dataset.id);
      }
      if (e.target.matches('a')) {
        watchedState.openedPost.add(e.target.dataset.id);
      }
    });

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(e.target);
      const inputValue = data.get('url');
      watchedState.form.status = 'processing';
      const links = watchedState.userEnteredLink;

      validateUrl(inputValue, links)
        .then(() => makeRequest(inputValue))
        .catch((err) => {
          if (err.name === 'ValidationError') {
            console.log(err);
            watchedState.form.error = err.type;
            watchedState.form.status = 'failed';
          } else if (err.name === 'AxiosError') {
            watchedState.loadingProcess.error = 'network';
            watchedState.loadingProcess.status = 'failed';
          } else if (err.name === 'isParsingError') {
            watchedState.loadingProcess.error = 'parsedError';
            watchedState.loadingProcess.status = 'failed';
          }
        });
    });

    const generatePromises = (state) => {
      const promises = state.feeds.map((feed, i) => axios.get(getUrlWithProxy(feed.link))
        .then((resp) => {
          const feedsCopy = JSON.parse(JSON.stringify(state.feeds));
          const parsedResponce = parse(resp.data.contents);
          const oldArr = feedsCopy.find((item) => item.id === feed.id).posts;
          const newArr = parsedResponce.posts;
          const newPosts = findNewValue(oldArr, newArr);
          feedsCopy[i].posts = [...oldArr, ...newPosts];
          if (newPosts) {
            state.feeds = [...feedsCopy];
          }
        })
        .catch((error) => console.log(error)));
      Promise.all(promises).then(() => {
        setTimeout(() => {
          generatePromises(state);
        }, 5000);
      });
    };
    generatePromises(watchedState);
  });
};

app();
