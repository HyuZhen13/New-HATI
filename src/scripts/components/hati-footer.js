class hatiFooter extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    this.innerHTML = `
  <section class="footer-sosmed">
    <ul class="footer-sosmed-list">
    <li><a href="https://web.facebook.com/HusenHandsome/" target="_blank"><i class="fab fa-facebook"></i></a></li>
    <li><a href="mailto:husaintok13@gmail.com target="blank"><i class="fa-solid fa-envelope"></i></a></li>
    <li><a href="https://www.linkedin.com/in/husain-abdullah-b986a2263" target="blank"><i class="fab fa-linkedin"></i></a></li>    </ul>
    <ul>
      <li class="watermark">Copyright © 2024 - HATI Development Team</li>
    </ul>
  </section>
      `;
  }
}

customElements.define('hati-footer', hatiFooter);
