import i18n from 'i18next';
import onChange from 'on-change';

const renderFeedback = (state, elements, i18n) => {
  if (state.form.status === 'valid') {
    // console.log('--- valid form ---');
    elements.feedback.innerHTML = i18n('loading.success');
    elements.feedback.classList.add('text-success');
    elements.feedback.classList.remove('text-danger');
  } else {
    // console.log('--- invalid form ---');
    elements.feedback.innerHTML = i18n('errors.notURL');
    elements.feedback.classList.add('text-danger');
    elements.feedback.classList.remove('text-success');
  }
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

  const postListItem = document.createElement('li');
  postListItem.classList.add('list-group-item');
  postListItem.classList.add('d-flex');
  postListItem.classList.add('justify-content-between');
  postListItem.classList.add('align-items-start');
  postListItem.classList.add('border-0');
  postListItem.classList.add('border-end-0');

  const aListItem = document.createElement('a');
  aListItem.href = state.feeds[0].items[0].link;
  aListItem.classList.add('fw-bold');
  aListItem.dataset.id = '2';
  aListItem.target = '_blank';
  aListItem.rel = 'noopener noreferrer';
  aListItem.textContent = state.feeds[0].items[0].title;

  postList.appendChild(postListItem);
  cardBodyPost.appendChild(postName);
  cardBorderPost.appendChild(cardBodyPost);
  cardBorderPost.appendChild(postList);
  elements.posts.appendChild(cardBorderPost);

  const [feeds] = state.feeds;
  feeds.items.forEach((element) => {
    const itemBlock = document.createElement('li');
    itemBlock.classList.add('list-group-item');
    itemBlock.classList.add('d-flex');
    itemBlock.classList.add('justify-content-between');
    itemBlock.classList.add('align-items-start');
    itemBlock.classList.add('border-0');
    itemBlock.classList.add('border-end-0');

    const aInside = document.createElement('a');
    aInside.href = element.link;
    aInside.classList.add('fw-bold');
    aInside.dataset.id = '2';
    aInside.target = '_blank';
    aInside.rel = 'noopener noreferrer';
    aInside.textContent = element.title;

    const buttonListItem = document.createElement('button');
    buttonListItem.type = 'button';
    buttonListItem.classList.add('btn');
    buttonListItem.classList.add('btn-outline-primary');
    buttonListItem.classList.add('btn-sm');
    buttonListItem.dataset.id = '2';
    buttonListItem.setAttribute('data-bs-toggle', 'modal');
    buttonListItem.setAttribute('data-bs-target', '#modal');
    buttonListItem.textContent = '????????????????';

    itemBlock.appendChild(aInside);
    itemBlock.appendChild(buttonListItem);
    postList.appendChild(itemBlock);
  });
};

const watch = (state, elements, i18n) => {
  const watchedState = onChange(state, (path) => {
    switch (path) {
      case 'form': {
        renderFeedback(state, elements, i18n);
        break;
      }
      case 'feeds': {
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
