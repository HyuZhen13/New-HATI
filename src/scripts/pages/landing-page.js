import { getAuth } from 'firebase/auth';
import '../../styles/landing-page.css';

const LandingPage = {
  async render() {
    return `
      <div class="container text-center mt-5">
        <img src="./favicon.png" alt="Logo" class="logo mb-4" />
        <div class="welcome-message mb-4">Selamat datang di Sistem Informasi Pertanian Kelompok Tani Sri Rahayu 3</div>
        <section class="auth-section mb-4"> 
          <div class="auth-container p-4">
            <button id="loginSystem" class="btn btn-primary btn-lg btn-block">Login ke Sistem</button>
          </div>
        </section>
        <button id="viewNews" class="btn btn-secondary btn-lg">Saya hanya ingin melihat berita</button>
      </div>
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
