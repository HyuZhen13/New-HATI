import { getAuth } from 'firebase/auth';

const LandingPage = {
  async render() {
    return `
      <article class="auth-article"> 
        <div class="auth-container">
          <h2>Selamat datang di Sistem Informasi Pertanian Kelompok Tani Sri Rahayu 3</h2>
          <button id="viewNews" class="view-news-button">Saya hanya ingin melihat berita</button>
          <button id="loginSystem" class="login-system-button">Login ke Sistem</button>
        </div>
      </article>
    `;
  },

  async afterRender() {
    const auth = getAuth();

    // Sembunyikan nav dan footer
    const nav = document.querySelector('nav');
    const footer = document.querySelector('footer');
    if (nav) nav.style.display = 'none';
    if (footer) footer.style.display = 'none';

    const viewNewsButton = document.querySelector('#viewNews');
    viewNewsButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '#/home'; // Mengarahkan ke homepage
    });

    const loginSystemButton = document.querySelector('#loginSystem');
    loginSystemButton.addEventListener('click', (event) => {
      event.preventDefault();
      window.location.href = '#/login'; // Mengarahkan ke halaman login
    });
  },
};

export default LandingPage;
