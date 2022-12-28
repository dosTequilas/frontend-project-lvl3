import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
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
        status: 'invalid', // добавить поле с датой, когда она пришла - отрисовываем
      },
      feeds: [],
    };

    const elements = {
      form: document.querySelector('form'),
      feedback: document.querySelector('.feedback'),
      feeds: document.querySelector('.feeds'),
      posts: document.querySelector('.posts'),
    };

    const watchedState = watch(initialState, elements, i18);

    // const userSchema = yup.string().url('notURL').required('required').notOneOf();

    const validateUrl = async (url, links) => {
      // const linksArr = Array.from(links); это точно без стейта нужно делать? какой стейт менять?
      console.log('links: ', links);
      console.log('url: ', url);
      const schema = yup
        .string()
        .url('notURL') // работает коряво
        // .required() не работает
        .notOneOf(links);// не работает
      return schema.validate();
    };

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();// чтобы не отправлял запрос сразу
      const data = new FormData(e.target);// чтобы получить доступ к введенным данным
      const inputValue = data.get('url');// сами данные
      const links = watchedState.userEnteredLink;
      // links.push(inputValue);
      // console.log(links);

      validateUrl(inputValue, links)
        .then(() => {
          watchedState.form = { status: 'valid' };
          watchedState.userEnteredLink.push(inputValue);
          console.log('валидацию прошел');
          console.log('inputValue: ', inputValue);
          axios.get(getUrlWithProxy(inputValue)).then((resp) => {
            const parsedResponce = parse(resp.data.contents);
            watchedState.feeds.push(parsedResponce);
            console.log('запрос отправлен');
          })
            .catch((err) => {
              console.log(err);
            });
        })// положительный результат и запрос
        .catch((err) => {
          console.log('ошибка: ', err);
          watchedState.form = { status: 'invalid' };
        });// обработка ошибки
    });
  });
};

app();
