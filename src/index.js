import 'bootstrap/dist/css/bootstrap.min.css';
import { string, url, required } from 'yup';

const userSchema = string().url().required();

const form = document.querySelector('form');
const feedback = document.querySelector('.feedback');

form.addEventListener('submit', (e) => {
  e.preventDefault();// чтобы не отправлял запрос сразу
  const data = new FormData(e.target);// чтобы получить доступ к введенным данным
  const inputValue = data.get('url');// сами данные
  userSchema.validate(inputValue)
    .then(() => {
      feedback.textContent = 'RSS успешно загружен';
      feedback.classList.add('text-success');
      feedback.classList.remove('text-danger');
    })// положительный рнезультат и запрос
    .catch(() => {
      feedback.textContent = 'Ссылка должна быть валидным URL'; // вместо текста - состояние
      feedback.classList.add('text-danger');
      feedback.classList.remove('text-success');
    });// обработка ошибки
});

// value

// validate

// parse and assert validity
// const enteredUrl = await userSchema.validate(await ());

// После отправки данных формы,
// приложение должно производить валидацию
// и подсвечивать красным рамку вокруг инпута,
// если адрес невалидный. Помимо корректности ссылки,
// нужно валидировать дубли. Если урл уже есть в списке фидов,
// то он не проходит валидацию. После того как поток добавлен,
// форма принимает первоначальный вид (очищается инпут, устанавливается фокус).
