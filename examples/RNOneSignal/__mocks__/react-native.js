const rn = require('react-native')
jest.mock('NetInfo', () => {
  return {
    isConnected: {
      fetch: () => {
        return new Promise((accept, resolve) => {
          accept(true);
        })
      }
    }
  }
});
module.exports = rn