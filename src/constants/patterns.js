const PATTERNS = Object.freeze({
  EMAIL: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
  PHONE: /^\+?[0-9\s\-()]{10,20}$/,
});

module.exports = PATTERNS;
