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
      feeds: [
        {
          link: 'https://ru.hexlet.io/lessons.rss',
          title: 'Новые уроки на Хекслете',
          description: 'Практические уроки по программированию',
          items: [
            {
              title: 'Язык SQL / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/sql/theory_unit',
              description: 'Цель: Изучить синтаксис SQL',
            },
            {
              title: 'Риски и опасности NULL / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/null/theory_unit',
              description: 'Цель: Узнать рисках и техниках работы со значением NULL',
            },
            {
              title: 'Объединение обработкой пропусков / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/outer-join/theory_unit',
              description: 'Цель: Познакомиться с LEFT/RIGHT/FULL OUTER JOIN и CROSS JOIN',
            },
            {
              title: 'Объединение нескольких таблиц / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/join/theory_unit',
              description: 'Цель: Научиться объединять таблицы с помощью JOIN',
            },
            {
              title: 'Сортировка результатов / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/order-by/theory_unit',
              description: 'Цель: Понять как в SQL работает сортировка',
            },
            {
              title: 'Группировка результатов / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/group-by/theory_unit',
              description: 'Цель: Научиться грамотно группировать данные',
            },
            {
              title: 'Фильтрация данных / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/where/theory_unit',
              description: 'Цель: Узнать как работает ключевое слово WHERE',
            },
            {
              title: 'Агрегация (SUM, MAX, AVG) / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/sum-max-avg/theory_unit',
              description: 'Цель: Познакомиться с другими агрегатными функциями',
            },
            {
              title: 'Агрегация (COUNT) / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/count/theory_unit',
              description: 'Цель: Понять как работает высокоуровневая агрегация',
            },
            {
              title: 'Введение / SQL в аналитике',
              link: 'https://ru.hexlet.io/courses/sql-analytics/lessons/intro/theory_unit',
              description: 'Цель: Познакомиться с курсом',
            },
            {
              title: 'Операторы упаковки и распаковки / Python: Функции',
              link: 'https://ru.hexlet.io/courses/python-functions/lessons/packaging-and-unpacking-operators/theory_unit',
              description: 'Цель: Узнать, как производить упаковку и распаковку итерабельных объектов и словарей',
            },
          ],
        },
      ], // состояние загрузки фида - в процессе. Логика парсинга в процесс загрузки
      latestFeeds: [],

    };

    const elements = {
      form: document.querySelector('form'),
      input: document.querySelector('input'),
      button: document.querySelector('button'),
      feedback: document.querySelector('.feedback'),
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
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
        // console.log(parsedResponce);
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

    // function renderPosts(feed) {
    //   const container = document.querySelector(`[data-id="${feed.id}"] .card-body`);
    //   feed.posts.forEach((post) => {
    //     const postElement = document.createElement('div');
    //     postElement.innerHTML = `
    //       <h5 class="card-title">${post.title}</h5>
    //       <p class="card-text">${post.description}</p>
    //       <a href="${post.link}" class="btn btn-primary" target="_blank">Read more</a>
    //     `;
    //     container.appendChild(postElement);
    //   });
    // }

    // setInterval(() => {
    //   feeds.forEach(async (feed) => {
    //     const response = await fetch(feed.url);
    //     const data = await response.text();
    //     const rss = parser(data);

    //     rss.items.forEach((item) => {
    //       const postExists = feed.posts.some((post) => post.link === item.link);
    //       if (!postExists) {
    //         feed.posts.push(item);
    //       }
    //     });

    //     renderPosts(feed);
    //   });
    // }, updateInterval);

    // async function fetchLatestPosts(initialState.userEnteredLink) {
    //   const feed = await parser.parseURL(initialState.userEnteredLink);
    //   console.log('fetchlatestPosts:', feed);
    //   return feed.items.map((item) => ({
    //     title: item.title,
    //     link: item.link,
    //     description: item.contentSnippet,
    //     date: new Date(item.isoDate),
    //   }));
    // }

    // function updateLatestPosts(feedPosts) {
    //   feedPosts.forEach((post) => {
    //     const isNewPost = !latestPosts.some((latestPost) => latestPost.link === post.link);
    //     if (isNewPost) {
    //       latestPosts.push(post);
    //     }
    //   });
    // }

    // function checkForNewPosts() {
    //   feeds.forEach(async (feedUrl) => {
    //     const feedPosts = await fetchLatestPosts(feedUrl);
    //     updateLatestPosts(feedPosts);
    //   });
    // }

    // setInterval(checkForNewPosts, 5000);

    // const findNewValue = (oldArr, newArr) => newArr.find((value) => !oldArr.includes(value));

    const generatePromises = (state) => {
      const promises = state.feeds.map((feed, i) => axios.get(getUrlWithProxy(feed.link))
        .then((resp) => {
          const parsedResponce = parse(resp.data.contents); // leetcode - структуры данных
          console.log(parsedResponce);
          // console.log('test finder: ', findNewValue(state.feeds, parsedResponce));
          // findNewValue(state.feeds, parsedResponce);

          // state.feeds[i].items.push[parsedResponce];//это новые данные, найти разницу и запушить.
          // feed.post - текущие, parsedResponce - новые данные. надо сранить их.
          // [1, 2, 3] - есть сейчас
          // [1, 2, 3, 4] - пришло
          // надо запушить в текущий фид то, что пришло
        })); // посты по фиду в стейте + есть новые посты? лодаш - сравнение массивов

      // где какие данные в приложении мы используем?

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

// const promises = generatePromises(watchedState);
// Promise.all(promises)
//   .then(() => {
//     // all promises have resolved
//   })
//   .catch((error) => {
//     // handle the error
//   });
