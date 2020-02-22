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

  dismissError = (id) => {
    this.errorQueue.removeKeys({[id]: true});

    this.invalidateQueueUpdater();
  };

  dismissAllErrors = (map = {}) => {
    this.errorQueue.removeKeys(map);

    this.invalidateQueueUpdater();
  };
}
