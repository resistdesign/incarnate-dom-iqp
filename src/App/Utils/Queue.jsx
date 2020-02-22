export default class Queue {
  static STATUS = {
    QUEUED: 'QUEUED',
    PROCESSING: 'PROCESSING'
  };

  queue = {};

  getUnregisteredKeys = (keys = []) => keys.filter(k => !this.queue[k]);

  isProcessing = () => Object
    .keys(this.queue)
    .filter(k => this.queue[k] === Queue.STATUS.PROCESSING).length > 0;

  addKeys = (keys = []) => keys
    .forEach(k => {
      if (this.queue[k] !== Queue.STATUS.PROCESSING) {
        this.queue[k] = Queue.STATUS.QUEUED;
      }
    });

  checkoutKeys = (keys = []) => keys
    .forEach(k => this.queue[k] = Queue.STATUS.PROCESSING);

  getNKeys = (n = 0) => {
    const keys = [];

    if (!this.isProcessing()) {
      const queueKeyList = Object.keys(this.queue);

      for (let i = 0; keys.length < n && i < queueKeyList.length; i++) {
        const k = queueKeyList[i];

        keys.push(k);
      }

      this.checkoutKeys(keys);
    }

    return keys;
  };

  removeKeys = (keys = []) => keys
    .forEach(k => delete this.queue[k]);
}
