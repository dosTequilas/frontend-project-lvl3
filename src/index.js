import 'bootstrap/dist/css/bootstrap.min.css';
import i18next from 'i18next';
import * as yup from 'yup';
import watch from './view.js';
import en from './lang/en.js';
import ru from './lang/ru.js';
import yupLocale from './lang/yup.js';

const app = () => {
  i18next.createInstance().init({
    lng: 'ru', // if you're using a language detector, do not define the lng option
    debug: true,
    resources: {
      ru,
      en,
    },
  }).then((i18) => {
    yup.setLocale(yupLocale);

    const initialState = {
      name: '',
      form: {
        status: 'invalid',
      },
    };
    const elements = {
      form: document.querySelector('form'),
      feedback: document.querySelector('.feedback'),
    };

    const watchedState = watch(initialState, elements, i18);

    const userSchema = yup.string().url('notURL').required('required');

    elements.form.addEventListener('submit', (e) => {
      e.preventDefault();// чтобы не отправлял запрос сразу
      const data = new FormData(e.target);// чтобы получить доступ к введенным данным
      const inputValue = data.get('url');// сами данные
      userSchema.validate(inputValue)
        .then(() => {
          watchedState.form = { status: 'valid' };
        })// положительный результат и запрос
        .catch(() => {
          watchedState.form = { status: 'invalid' };
        });// обработка ошибки
    });
  });
};

app();
