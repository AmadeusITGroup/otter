const createSpinner = () => ({
  fail() {},
  start() {
    return this;
  },
  stop() {},
  succeed() {}
});

export default createSpinner;
