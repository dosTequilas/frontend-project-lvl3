import i18n from 'i18next';
import onChange from 'on-change';
// из view слоя нельзя менять состояние модели
const renderFeedback = (state, elements, i18n) => {
  if (state.form.status === 'valid') {
    elements.feedback.innerHTML = i18n('loading.success');
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
  } else if (state.form.status === 'failed') {
    setTimeout(() => {
      elements.feedback.innerHTML = i18n(`errors.${state.form.error}`);
    }, 10);
    console.log('state error: ', state.form.error);
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }
};

const renderLoadingFeedback = (state, elements, i18n) => {
  if (state.loadingProcess.status === 'error') {
    elements.feedback.innerHTML = i18n(`errors.${state.loadingProcess.error}`);
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }
};

const modalPreparation = (state, elements, i18n) => {
  const currentPost = state.feeds[0].items.find((post) => post.id === state.currentPostId);
  // modalTitle: document.querySelector('.modal-title'),
  // modalBody: document.querySelector('.modal-body'),
  // modalClose: document.querySelector('.modal-close'),
  // modalMore: document.querySelector('.more-link'),
  elements.modalTitle.textContent = currentPost.title;
  elements.modalBody.textContent = currentPost.description;
  elements.modalClose.textContent = i18n('close');
  elements.modalMore.textContent = i18n('more');

  // V | первое заполнение данных
  // ? | поиск внутри функции - можно, а зачем, обязательно ли ее переносить куда-то отсюда?
  // V | все проходит через локаль
  // V | отдельным полем в стейте ui store
};

const renderFeeds = (state, elements, i18n) => {
  const cardBorder = document.createElement('div');
  cardBorder.classList.add('card');
  cardBorder.classList.add('border-0');

  const cardBody = document.createElement('div');
  cardBody.classList.add('card-body');

  const feedName = document.createElement('h2');
  feedName.classList.add('card-title');
  feedName.classList.add('h4');
  feedName.textContent = i18n('feeds');

  cardBody.appendChild(feedName);
  cardBorder.appendChild(cardBody);
  elements.feeds.innerHTML = '';
  elements.feeds.appendChild(cardBorder);

  const title = document.createElement('h3');
  title.classList.add('h6');
  title.classList.add('m-0');
  title.textContent = state.feeds[0].title;

  const description = document.createElement('p');
  description.classList.add('m-0');
  description.classList.add('small');
  description.classList.add('text-black-50');

  description.textContent = state.feeds[0].description;

  const listItem = document.createElement('li');
  listItem.classList.add('list-group-item');
  listItem.classList.add('border-0');
  listItem.classList.add('border-end-0');

  const list = document.createElement('ul');
  list.classList.add('list-group');
  list.classList.add('border-0');
  list.classList.add('rounded-0');

  listItem.appendChild(title);
  listItem.appendChild(description);
  list.appendChild(listItem);
  cardBody.appendChild(list);

  const postName = document.createElement('h2');
  postName.classList.add('card-title');
  postName.classList.add('h4');
  postName.textContent = i18n('posts');

  const cardBodyPost = document.createElement('div');
  cardBodyPost.classList.add('card-body');

  const cardBorderPost = document.createElement('div');
  cardBorderPost.classList.add('card');
  cardBorderPost.classList.add('border-0');

  const postList = document.createElement('ul');
  postList.classList.add('list-group');
  postList.classList.add('border-0');
  postList.classList.add('rounded-0');

  cardBorderPost.appendChild(postList);
  elements.posts.textContent = '';
  elements.posts.appendChild(cardBorderPost);

  const { feeds } = state;
  feeds.forEach((feed) => {
    feed.items.forEach((post) => {
      const itemBlock = document.createElement('li');
      itemBlock.classList.add('list-group-item');
      itemBlock.classList.add('d-flex');
      itemBlock.classList.add('justify-content-between');
      itemBlock.classList.add('align-items-start');
      itemBlock.classList.add('border-0');
      itemBlock.classList.add('border-end-0');

      const aInside = document.createElement('a');
      aInside.href = post.link;
      aInside.classList.add('fw-bold');
      aInside.dataset.id = post.id;
      aInside.target = '_blank';
      aInside.rel = 'noopener noreferrer';
      aInside.textContent = post.title;

      const buttonListItem = document.createElement('button');
      buttonListItem.type = 'button';
      buttonListItem.classList.add('btn');
      buttonListItem.classList.add('btn-outline-primary');
      buttonListItem.classList.add('btn-sm');
      buttonListItem.dataset.id = post.id;
      buttonListItem.setAttribute('data-toggle', 'modal');
      buttonListItem.setAttribute('data-target', '#exampleModal'); // может имеет смысл убрать этот example и сделать просто modal?
      buttonListItem.textContent = 'Просмотр';

      itemBlock.appendChild(aInside);
      itemBlock.appendChild(buttonListItem);
      postList.appendChild(itemBlock);
    });
  });
};

const watch = (state, elements, i18n) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status': {
        renderFeedback(state, elements, i18n);
        if (state.form.status === 'processing') {
          elements.button.disabled = true;
          elements.input.disabled = true;
        } else if (state.form.status === 'idle') { // кандидат на удаление
          elements.button.disabled = false;
          elements.input.disabled = false;
        } else if (state.form.status === 'valid') {
          elements.button.disabled = false;
          elements.input.disabled = false;
        } else if (state.form.status === 'failed') {
          elements.button.disabled = false;
          elements.input.disabled = false;
        }
        break;
      }

      case 'loadingProcess.status': {
        renderLoadingFeedback(state, elements, i18n);
        elements.button.disabled = false;
        elements.input.disabled = false;
        break;
      }

      case 'feeds': {
        renderFeeds(state, elements, i18n);
        break; // + отслеживание постов
      }
      case 'currentPostId': {
        modalPreparation(state, elements, i18n);
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
