import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../api";

const UserLoginForm = () => {
  // navigation was previously unused; removed to satisfy eslint no-unused-vars

  const [loginRequest, setLoginRequest] = useState({
    emailId: "",
    password: "",
    role: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleUserInput = (e) => {
    setLoginRequest({ ...loginRequest, [e.target.name]: e.target.value });
  };

  const loginAction = (e) => {
    e.preventDefault();
    // basic validation
    if (!loginRequest.role || loginRequest.role === "0") {
      toast.error('Please select a role', { position: 'top-center' });
      return;
    }

    if (!loginRequest.emailId || !loginRequest.password) {
      toast.error('Please provide email and password', { position: 'top-center' });
      return;
    }

    (async () => {
      setIsLoggingIn(true);
      try {
        const res = await api.post("/api/user/login", loginRequest);
        const data = res.data;
        if (data && data.success && data.jwtToken) {
          // persist session
          if (data.user.role === "Admin") {
            sessionStorage.setItem("active-admin", JSON.stringify(data.user));
            sessionStorage.setItem("admin-jwtToken", data.jwtToken);
          } else if (data.user.role === "Customer") {
            sessionStorage.setItem("active-customer", JSON.stringify(data.user));
            sessionStorage.setItem("customer-jwtToken", data.jwtToken);
          } else if (data.user.role === "Tour Guide") {
            sessionStorage.setItem("active-guide", JSON.stringify(data.user));
            sessionStorage.setItem("guide-jwtToken", data.jwtToken);
          }

          toast.success(data.responseMessage || "Logged in successfully", { position: "top-center" });
          setTimeout(() => (window.location.href = "/home"), 800);
        } else {
          toast.error((data && data.responseMessage) || "Login failed", { position: "top-center" });
        }
      } catch (err) {
        console.error('Login error', err);
        if (err && err.response && err.response.data && err.response.data.responseMessage) {
          toast.error(err.response.data.responseMessage, { position: 'top-center' });
        } else if (err && err.response && err.response.data && err.response.data.message) {
          toast.error(err.response.data.message, { position: 'top-center' });
        } else {
          toast.error("Server error — please try again later", { position: "top-center" });
        }
      } finally {
        setIsLoggingIn(false);
      }
    })();
  };

  return (
    <div>
      <div className="mt-2 d-flex aligns-items-center justify-content-center">
        <div className="form-card border-color" style={{ width: "25rem" }}>
          <div className="container-fluid">
            <div
              className="card-header bg-color custom-bg-text mt-2 d-flex justify-content-center align-items-center"
              style={{
                borderRadius: "1em",
                height: "38px",
              }}
            >
              <h4 className="card-title">User Login</h4>
            </div>
            <div className="card-body mt-3">
              <form>
                <div class="mb-3 text-color">
                  <label for="role" class="form-label">
                    <b>User Role</b>
                  </label>
                  <select
                    onChange={handleUserInput}
                    className="form-control"
                    name="role"
                  >
                    <option value="0">Select Role</option>
                    <option value="Admin"> Admin </option>
                    <option value="Tour Guide"> Tour Guide </option>
                    <option value="Customer"> Customer </option>
                  </select>
                </div>

                <div className="mb-3 text-color">
                  <label for="emailId" class="form-label">
                    <b>Email Id</b>
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="emailId"
                    name="emailId"
                    onChange={handleUserInput}
                    value={loginRequest.emailId}
                  />
                </div>
                <div className="mb-3 text-color">
                  <label for="password" className="form-label">
                    <b>Password</b>
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    onChange={handleUserInput}
                    value={loginRequest.password}
                    autoComplete="on"
                  />
                </div>
                <div className="d-flex aligns-items-center justify-content-center mb-2">
                  <button
                    type="submit"
                    className="btn bg-color custom-bg-text"
                    onClick={loginAction}
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                        Logging in...
                      </>
                    ) : (
                      'Login'
                    )}
                  </button>
                  <ToastContainer />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoginForm;
