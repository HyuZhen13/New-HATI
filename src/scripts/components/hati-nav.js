import UserInfo from '../utils/user-info';

class hatiNav extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    if (UserInfo.getUserInfo().uid) {
      this.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-light">
          <div class="container-fluid">
            <a class="navbar-brand mb-0 h1" href="#/home">
              <img class="lazyload" crossorigin="anonymous" src="./favicon.png" alt="Logo" width="40" height="40" class="d-inline-block align-text-top">
              HATI
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#/home">Home</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#/home" id="featuresDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Features
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="featuresDropdown">
                    <li><a class="dropdown-item" href="#/marketplace">Marketplace</a></li>
                    <li><a class="dropdown-item" href="#/cart">Keranjang</a></li>
                    <li><a class="dropdown-item" href="#/order">Pesanan</a></li>
                    <li><a class="dropdown-item" href="#/home" onclick="scrollToNews()">Berita</a></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a class="nav-link active" href="#/about">About Us</a>
                </li>
              </ul>
              <form class="d-flex" role="search">
                <a href="#/profile" class="btn btn-outline-dark btn-login" type="submit" id="btn-login" style="padding:0;">
                  <img id="profile-button" src="./Images/profile.png" alt="Profile" width="50" height="50">
                </a>
              </form>
            </div>
          </div>
        </nav>
      `;
    } else {
      this.innerHTML = `
        <nav class="navbar navbar-expand-lg bg-light">
          <div class="container-fluid">
            <a class="navbar-brand mb-0 h1" href="#/home">
              <img src="./favicon.png" alt="Logo" width="40" height="40" class="d-inline-block align-text-top">
              HATI
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarSupportedContent">
              <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item">
                  <a class="nav-link active" aria-current="page" href="#/home">Home</a>
                </li>
                <li class="nav-item dropdown">
                  <a class="nav-link dropdown-toggle" href="#/home" id="featuresDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    Features
                  </a>
                  <ul class="dropdown-menu" aria-labelledby="featuresDropdown">
                    <li><a class="dropdown-item" href="#/marketplace">Marketplace</a></li>
                    <li><a class="dropdown-item" href="#/cart">Keranjang</a></li>
                    <li><a class="dropdown-item" href="#/order">Pesanan</a></li>
                    <li> <a class="dropdown-item" href="#/home" onclick="scrollToNews()">Berita</a></li>
                  </ul>
                </li>
                <li class="nav-item">
                  <a class="nav-link active" href="#/about">About Us</a>
                </li>
              </ul>
              <form class="d-flex" role="search">
                <a href="#/login" class="btn btn-outline-dark btn-login" type="submit" id="btn-login">Login</a>
              </form>
            </div>
          </div>
        </nav>
      `;
    }
  }
}

customElements.define('hati-nav', hatiNav);
