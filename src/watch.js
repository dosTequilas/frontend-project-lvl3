import onChange from 'on-change';

logic;

const app = () => {
  const initialState = {
    name: '',
    form: {
      valid: false,
    },
  };
  // index js

  const watchedState = watch(initialState); // index js

  watchedState.form.valid = false;
  watchedState.form.valid = true;

  // form.addEventListener('submit', () => {});
  // index js
};

const watch = (state, elements) => {
  const watchedState = onChange(state, (path, value) => {
    console.log('path: ', path);
    console.log('value: ', value);

    switch (path) {
      case 'form.valid': {
        renderFeedback(state, elements);
      }

      default: {}
    }
  });

  return watchedState;
}; // view js

const renderFeedback = (state, elements) => {
  if (state.form.valid) {
    console.log('--- valid form ---');
    // elements.feedback.textContent = 'valid form'
  } else {
    console.log('--- invalid form ---');
    // elements.feedback.textContent = 'invalid form'
  }
}; // view js

app();
