async function fetchLatestPosts(feedUrl) {
  const feed = await parser.parseURL(feedUrl);
  return feed.items.map((item) => ({
    title: item.title,
    link: item.link,
    description: item.contentSnippet,
    date: new Date(item.isoDate),
  }));
}

function updateLatestPosts(feedPosts) {
  feedPosts.forEach((post) => {
    const isNewPost = !latestPosts.some((latestPost) => latestPost.link === post.link);
    if (isNewPost) {
      latestPosts.push(post);
    }
  });
}

function checkForNewPosts() {
  feeds.forEach(async (feedUrl) => {
    const feedPosts = await fetchLatestPosts(feedUrl);
    updateLatestPosts(feedPosts);
  });
}

setInterval(checkForNewPosts, 5000);
