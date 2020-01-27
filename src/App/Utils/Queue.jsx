export default class Queue {
  queue = {};

  isProcessing = () => Object
    .keys(this.queue)
    .filter(k => this.queue[k] === true).length > 0;

  addKeys = (map = {}) => Object
    .keys(map)
    .forEach(k => {
      if (this.queue[k] !== true) {
        this.queue[k] = map[k];
      }
    });

  checkoutKeys = (map = {}) => Object
    .keys(map)
    .forEach(k => this.queue[k] = true);

  getNValues = (n = 0) => {
    const valueMap = {};

    if (!this.isProcessing()) {
      const queueKeyList = Object.keys(this.queue);
      const valueKeyList = [];

      for (let i = 0; valueKeyList.length < n && i < queueKeyList.length; i++) {
        const key = queueKeyList[i];
        const value = this.queue[key];

        if (value !== true) {
          valueKeyList.push(key);
          valueMap[key] = value;
        }
      }

      this.checkoutKeys(valueMap);
    }

    return valueMap;
  };

  removeKeys = (map = {}) => Object
    .keys(map)
    .forEach(k => delete this.queue[k]);
}
