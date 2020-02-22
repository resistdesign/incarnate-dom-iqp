export default class ItemQueueProcessorController {
  /**
   * @type {Queue}
   * */
  errorQueue;

  /**
   * @type {Function}
   * */
  invalidateQueueUpdater;

  constructor(config = {}) {
    Object.assign(this, config);
  }

  dismissError = (key) => {
    this.errorQueue.removeKeys([key]);

    this.invalidateQueueUpdater();
  };

  dismissAllErrors = (keys = []) => {
    this.errorQueue.removeKeys(keys);

    this.invalidateQueueUpdater();
  };
}
