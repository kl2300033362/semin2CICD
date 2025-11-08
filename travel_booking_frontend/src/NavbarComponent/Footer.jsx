import { Link } from "react-router-dom";
const Footer = () => {
  return (
    <div>
      <div class="container my-5">
        <footer class="text-center text-lg-start text-color">
          <div class="container-fluid p-4 pb-0">

            <section className="text-center">
              <div className="footer-login-area d-flex justify-content-center align-items-center">
                <div className="login-bubble-wrap">
                  <div className="login-box p-3 text-center">
                    <div className="login-title mb-2 custom-bg-text">Login from here</div>
                    <Link to="/user/login" className="active">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-rounded bg-color custom-bg-text login-btn"
                      >
                        Log in
                      </button>
                    </Link>
                  </div>

                  {/* decorative bubbles around the login box */}
                  <div className="footer-bubbles" aria-hidden>
                    <span className="fbubble fb1" />
                    <span className="fbubble fb2" />
                    <span className="fbubble fb3" />
                    <span className="fbubble fb4" />
                    <span className="fbubble fb5" />
                  </div>
                </div>

                {/* a larger floating context card next to the login area */}
                <div className="floating-context card p-4 ms-4 d-none d-md-block">
                  <h4 className="mb-2">Welcome to Tours & Travels</h4>
                  <p className="mb-0">Fast bookings • Trusted guides • 24/7 support</p>
                </div>
              </div>
            </section>
          </div>

          <div class="text-center">
            © 2023 Copyright:
            <a class="text-color-3" href="#">
              tourandtravels.com
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Footer;
