const AboutPage = {
  async render() {
    return `
      <style>
      /* CSS styling untuk halaman About Us */
      
      .container {
        max-width: 800px;
        margin: 0 auto;
        background-color: ghostwhite;
        padding: 30px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        border-radius: 4px;
      }

      h1 {
        font-size: 28px;
        margin-bottom: 20px;
      }

      p {
        margin-bottom: 10px;
      }

      h1, .top {
        text-align:center;
      }

      .highlight {
        font-weight: bold;
      }

      .features {
        margin-top: 40px;
      }

      .feature {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }

      .feature img {
        width: 150px;
        margin-right: 15px;
        cursor: pointer;
        transition: filter 0.3s ease;
      }
      
      .feature img:hover {
        filter: brightness(90%);
        box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(0, 0, 255, 0.5);
        animation: box-shadow-animation 5s ease-in-out infinite;
        padding-inline: 0;
      }
      
      @keyframes box-shadow-animation {
        0% {
          box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(0, 0, 255, 0.5);
        }
        
        15% {
          box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(0, 0, 255, 0.5);
        }
        
        30% {
          box-shadow: 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(255, 0, 255, 0.5), 0px 0px 10px 5px rgba(0, 0, 255, 0.5);
        }
        
        50% {
          box-shadow: 0px 0px 10px 5px rgba(255, 0, 0, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(255, 0, 255, 0.5);
        }
      
        65% {
          box-shadow: 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(255, 0, 255, 0.5), 0px 0px 10px 5px rgba(0, 0, 255, 0.5);
        }
      
        85% {
          box-shadow: 0px 0px 10px 5px rgba(255, 0, 255, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5), 0px 0px 10px 5px rgba(255, 0, 0, 0.5);
        }
        
        100% {
          box-shadow: 0px 0px 10px 5px rgba(0, 0, 255, 0.5), 0px 0px 10px 5px rgba(255, 0, 255, 0.5), 0px 0px 10px 5px rgba(0, 255, 0, 0.5);
        }
      }

      .feature-text {
        flex: 1;
      }

      .feature-title {
        font-size: 20px;
        margin-bottom: 5px;
      }

      .feature-description {
      }

      .about-footer {
        margin: 0 auto;
        max-width: 800px;
        padding: 10px;
        text-align: center;
      }

      .footer-developer {
        padding: 15px;
        font-size: 1rem;
        letter-spacing: 5px;
        margin-bottom: 5px;
      }

      .footer-developer-list ul {
        list-style-type: none;
        padding-top: 5px;
        padding-bottom: 6px;
        background-image:url(./Images/background-about-dev.png);
        box-shadow: 0px 0px 10px 5px rgba(0, 0, 0, 0.5), 0px 0px 10px 5px rgba(0, 0, 0, 0.5);
      }
      
      .footer-developer-list li {
        display: inline-block;
        margin-right: 13px;
        margin-left: 7px;
        text-decoration: none;
        color: inherit;
        font-style: italic;
        font-weight: bold;
        transition: all 1s ease;
        font-size: 0.8rem;
      }

      
      @media (max-width: 320px) {
        .feature {
          display: block;
        }

        .feature-text {
          margin-top: 5px;
        }
      }

      @media (max-width: 802px) {
        .footer-developer-list li {
          display: block;
          margin-right: 0;
          margin-bottom: 10px;
        }
      }

    </style>
 
    <div class="container">
      <h1>Tentang Kami</h1>
      <p class="top">Proyek Website Pertanian yang kami beri nama <span class="highlight">HATI (Hasil Tani)</span> bertujuan untuk menjadi platform modern bagi para petani dan pecinta pertanian. Dalam platform ini, kami menyediakan fitur yang menarik seperti Marketplace dan Berita Pertanian Terkini.</p>
      
      <div class="features">
        <div class="feature">
          <img class="lazyload" crossorigin="anonymous" src="./Images/marketplace-icon.png" alt="Marketplace Icon" onclick="window.location.href='#/marketplace'">
          <div class="feature-text">
            <h2 class="feature-title">Marketplace</h2>
            <p class="feature-description">Kami menyediakan platform online yang mempertumakan para petani dan pembeli. Melalui platform kami, Anda dapat menjual dan mencari produk hasil pertanian secara luas baik dalam negeri maupun luar negeri.</p>
          </div>
        </div>
        <div class="feature">
          <img class="lazyload" crossorigin="anonymous" src="./Images/news-icon.png" alt="News Icon" onclick="window.location.href='#/'">
          <div class="feature-text">
            <h2 class="feature-title">Berita Pertanian Terkini</h2>
            <p class="feature-description">Kami juga menyajikan berita terkini seputar dunia pertanian. Dapatkan informasi terbaru mengenai produk hasil pertanian, teknik pertanian terbaru, dan berita pertanian menarik lainnya.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="about-footer">
    <div class="footer-developer"><p> Tim Pengembang :</p></div>
    <div class="footer-developer-list">
      <ul>
        <li>- Hyuzhen IT ( Developer ) </li>
        <li>- Sekretaris Sri Rahayu 3 ( Admin ) </li>
      </ul>
    </div>
    </div>
      `;
  },
  async afterRender() {
    console.log('About Us');
  },
};
export default AboutPage;
