export default class ItemQueueProcessorController {
  /**
   * @type {Queue}
   * */
  errorQueue;

  /**
   * @type {Function}
   * */
  getErrorMap;

  /**
   * @type {Function}
   * */
  setErrorMap;

  /**
   * @type {Function}
   * */
  invalidateQueueUpdater;

  constructor(config = {}) {
    Object.assign(this, config);
  }

  dismissError = (key) => {
    const newErrorMap = {
      ...this.getErrorMap()
    };

    this.errorQueue.removeKeys([key]);

    delete newErrorMap[key];

    this.setErrorMap(newErrorMap);
    this.invalidateQueueUpdater();
  };

  dismissAllErrors = (keys = []) => {
    const errorMap = {
      ...this.getErrorMap()
    };

    this.errorQueue.removeKeys(keys);

    this.setErrorMap(
      Object
        .keys(errorMap)
        .filter(k => keys.indexOf(k) === -1)
        .reduce((acc, k) => ({
          ...acc,
          [k]: errorMap[k]
        }), {})
    );
    this.invalidateQueueUpdater();
  };
}
