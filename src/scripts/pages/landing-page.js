import { getAuth } from 'firebase/auth';

const LandingPage = {
  async render() {
    return `
      <style>
        body {
          background-color: #f0f0f0; /* Ganti dengan warna background body yang sesuai */
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: space-between;
          min-height: 100vh;
          margin: 0;
        }
        .welcome-message {
          font-size: 24px;
          font-weight: bold;
          margin-top: 20px;
          text-align: center;
        }
        .view-news-button {
          font-size: 16px;
          background-color: #333; /* Warna tombol lebih gelap */
          color: white;
          border: none;
          padding: 10px 20px;
          margin-bottom: 20px;
          cursor: pointer;
          border-radius: 5px;
          text-align: center;
        }
        .view-news-button:hover {
          background-color: #555; /* Warna lebih gelap saat tombol di-hover */
        }
        .auth-container {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
      </style>
      <div class="welcome-message">Selamat datang di Sistem Informasi Pertanian Kelompok Tani Sri Rahayu 3</div>
      <article class="auth-article"> 
        <div class="auth-container">
          <button id="loginSystem" class="login-system-button">Login ke Sistem</button>
        </div>
      </article>
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
