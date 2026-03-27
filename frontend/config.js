window.APP_CONFIG = {
  API_BASE_URL:
    window.location.hostname === "localhost" && window.location.port === "5500"
      ? "http://localhost:5000"
      : "",
};
