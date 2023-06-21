import onChange from 'on-change';

const renderFeedback = (state, elements, i18n) => {
  if (state.form.status === 'valid') {
    elements.feedback.innerHTML = i18n('loading.success');
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
  } else if (state.form.status === 'failed') {
    elements.feedback.innerHTML = i18n(`errors.${state.form.error}`);
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }
};

const renderLoadingFeedback = (state, elements, i18n) => {
  const { feedback } = elements;
  console.log(elements);
  feedback.innerHTML = i18n(`errors.${state.loadingProcess.error}`);
  feedback.classList.add('text-danger');
  feedback.classList.remove('text-success');
};

const modalPreparation = (state, elements, i18n) => {
  const {
    modalTitle,
    modalBody,
    modalClose,
    modalMore,
  } = elements;
  const posts = state.feeds.reduce((acc, curr) => [...acc, ...curr.posts], []);
  const currentPost = posts.find((post) => post.id === state.currentPostId);

  modalTitle.textContent = currentPost.title;
  modalBody.textContent = currentPost.description;
  modalClose.textContent = i18n('close');
  modalMore.textContent = i18n('more');
  modalMore.href = currentPost.link;
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
  const { feeds: feedsElement } = elements;
  feedsElement.innerHTML = '';
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
  const { posts } = elements;
  const postsElement = posts;
  postsElement.textContent = '';
  elements.posts.appendChild(cardBorderPost);

  const { feeds } = state;
  feeds.forEach((feed) => {
    feed.posts.forEach((post) => {
      const itemBlock = document.createElement('li');
      itemBlock.classList.add('list-group-item');
      itemBlock.classList.add('d-flex');
      itemBlock.classList.add('justify-content-between');
      itemBlock.classList.add('align-items-start');
      itemBlock.classList.add('border-0');
      itemBlock.classList.add('border-end-0');

      const postLink = document.createElement('a');
      postLink.href = post.link;
      postLink.classList.add(state.openedPost.has(post.id) ? 'fw-normal link-secondary' : 'fw-bold');
      postLink.dataset.id = post.id;
      postLink.target = '_blank';
      postLink.rel = 'noopener noreferrer';
      postLink.textContent = post.title;

      const buttonListItem = document.createElement('button');
      buttonListItem.type = 'button';
      buttonListItem.classList.add('btn');
      buttonListItem.classList.add('btn-outline-primary');
      buttonListItem.classList.add('btn-sm');
      buttonListItem.dataset.id = post.id;
      buttonListItem.setAttribute('data-toggle', 'modal');
      buttonListItem.setAttribute('data-target', '#exampleModal');
      buttonListItem.textContent = 'Просмотр';

      itemBlock.appendChild(postLink);
      itemBlock.appendChild(buttonListItem);
      postList.appendChild(itemBlock);
    });
  });
};

const watch = (state, elements, i18n) => {
  const { button, input } = elements;

  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form.status': {
        renderFeedback(state, elements, i18n);
        if (state.form.status === 'processing') {
          button.disabled = true;
          input.disabled = true;
        } else {
          button.disabled = false;
          input.disabled = false;
        }
        break;
      }

      case 'loadingProcess.status': {
        renderLoadingFeedback(state, elements, i18n);
        button.disabled = false;
        input.disabled = false;
        break;
      }

      case 'feeds': {
        renderFeeds(state, elements, i18n);
        break;
      }

      case 'currentPostId': {
        modalPreparation(state, elements, i18n);
        break;
      }

      case 'openedPost': {
        renderFeeds(state, elements, i18n);
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
