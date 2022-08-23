import 'bootstrap/dist/css/bootstrap.min.css';
import { string, url, required } from 'yup';
import watch from './view.js';

const app = () => {
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

  const watchedState = watch(initialState, elements);

  const userSchema = string().url().required();

  elements.form.addEventListener('submit', (e) => {
    e.preventDefault();// чтобы не отправлял запрос сразу
    const data = new FormData(e.target);// чтобы получить доступ к введенным данным
    const inputValue = data.get('url');// сами данные
    userSchema.validate(inputValue)
      .then(() => {
        watchedState.form.status = 'valid';
      })// положительный результат и запрос
      .catch(() => {
        watchedState.form.status = 'invalid';
      });// обработка ошибки
  });
};

app();

// что в каком порядке происходит?
// сначала импортируется watch?
// потом запускается app?
// потом мы создаем watchedState, в котором пока ничего нет?
// потом создаем userSchema?
// потом эвентлистнер на сабмит?
// потом перехватываем данные и проводим валидацию?
// если все хорошо - добавляем initialState.form.valid.true? или watchedState?
// тогда как рендер поймет, что пора рендерить обновленную страницу?
// в watched state надо пробросить элементы, в которые надо встаить данные после рендеринга?
