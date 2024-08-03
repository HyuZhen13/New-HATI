import NewsData from '../utils/news-data';

const NewsPage = {
  render() {
    return `
      <hati-carousel></hati-carousel>
      <form class="search-form row g-3 form-search-product" id="searchForm" name="searchForm">
        <div class="col-sm-7">
          <input type="text" class="form-control search-input search-product" placeholder="Search News" name="searchInput">
        </div>
        <div class="col-sm">
          <button type="submit" class="btn btn-primary search-product-btn">Search</button>
        </div>
      </form>
      <div id="news-container"></div>
      <div id="loading-indicator" class="loading-indicator">
        <i class="fas fa-spinner fa-spin"></i>
      </div>
      <div id="not-found-message" class="not-found-message">No news found.</div>
    `;
  },

  async afterRender() {
    const newsContainer = document.getElementById('news-container');
    const searchForm = document.querySelector('#searchForm');
    const notFoundMessage = document.getElementById('not-found-message');

    // Menampilkan nav dan footer kembali
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (nav) nav.style.display = 'block';
    if (footer) footer.style.display = 'block';

    const news = await NewsData.getNews();

    function getMonthName(monthIndex) {
      const months = [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ];
      return months[monthIndex];
    }

    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      newsContainer.innerHTML = '';
      const searchInput = document.forms.searchForm.searchInput.value;
      const filteredNews = Object.values(news).filter((newsItem) => newsItem.title.toLowerCase().includes(searchInput.toLowerCase()));

      filteredNews.reverse().forEach((newsItem) => {
        const newsElement = document.createElement('div');
        const uploadDate = new Date(Number(newsItem.id));
        const formattedDate = `${uploadDate.getDate()} ${getMonthName(uploadDate.getMonth())} ${uploadDate.getFullYear()}`;
        newsElement.innerHTML = `
          <h2>${newsItem.title}</h2>
          <img src="${newsItem.image}" loading="lazy" class="news-picture">
          <p class="date-published">Published on ${formattedDate}</p>
          <p class="news-description">${newsItem.body}</p>
          <button class="news-button" id="detail-news-${newsItem.id}">More Info</button>
        `;
        newsElement.classList.add('news-item');
        newsContainer.appendChild(newsElement);

        document.querySelector(`#detail-news-${newsItem.id}`).addEventListener('click', () => {
          location.href = `#/news/${newsItem.id}`;
        });
      });

      if (filteredNews.length === 0) {
        notFoundMessage.style.display = 'block';
      } else {
        notFoundMessage.style.display = 'none';
      }
    });

    Object.values(news).reverse().forEach((newsItem) => {
      const newsElement = document.createElement('div');
      const uploadDate = new Date(Number(newsItem.id));
      const formattedDate = `${uploadDate.getDate()} ${getMonthName(uploadDate.getMonth())} ${uploadDate.getFullYear()}`;
      newsElement.innerHTML = `
        <h2>${newsItem.title}</h2>
        <img src="${newsItem.image}" loading="lazy" class="news-picture">
        <p class="date-published">Published on ${formattedDate}</p>
        <p class="news-description">${newsItem.body}</p>
        <button class="news-button" id="detail-news-${newsItem.id}">More Info</button>
      `;
      newsElement.classList.add('news-item');
      newsContainer.appendChild(newsElement);

      document.querySelector(`#detail-news-${newsItem.id}`).addEventListener('click', () => {
        location.href = `#/news/${newsItem.id}`;
      });
    });

    notFoundMessage.style.display = 'none';
  },
};

export default NewsPage;
