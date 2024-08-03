import { getAuth } from 'firebase/auth';
import './landing-page.css'; // Pastikan Anda menyesuaikan path sesuai dengan struktur proyek Anda

const LandingPage = {
  async render() {
    return `
      <div class="welcome-message">Selamat datang di Sistem Informasi Pertanian Kelompok Tani Sri Rahayu 3</div>
      <section class="auth-section"> 
        <div class="auth-container">
          <button id="loginSystem" class="login-system-button">Login ke Sistem</button>
        </div>
      </section>
      <button id="viewNews" class="view-news-button">Saya hanya ingin melihat berita</button>
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
