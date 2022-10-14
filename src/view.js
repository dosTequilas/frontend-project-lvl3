import onChange from 'on-change';

// вставляет классы и контент в верстку
const renderFeedback = (state, elements, i18next) => {
  console.log(state);
  if (state.form.status === 'valid') {
    console.log('--- valid form ---');
    // elements.feedback.innerHTML = 'RSS успешно загружен';
    elements.feedback.innerHTML = i18next('loading.success');
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
  } else {
    console.log('--- invalid form ---');
    // elements.feedback.innerHTML = 'Ссылка должна быть валидным URL';
    elements.feedback.innerHTML = i18next('errors.notURL');
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }
};

// отслеживает состояние и запускает рендер
const watch = (state, elements, i18next) => {
  const watchedState = onChange(state, (path, value) => {
    console.log('path:', path);

    switch (path) {
      case 'form': {
        renderFeedback(state, elements, i18next);
        break;
      }
      default: {
        break;
      }
    }
  });

  return watchedState;
};

export default watch;
