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

  getNewErrorMap = () => ({...this.getErrorMap()});

  getAllErrorKeys = () => Object.keys(this.getNewErrorMap());

  dismissErrorList = (keys = []) => {
    const newErrorMap = this.getNewErrorMap();

    this.setErrorMap(
      Object
        .keys(newErrorMap)
        .filter(k => keys.indexOf(k) === -1)
        .reduce((acc, k) => ({
          ...acc,
          [k]: newErrorMap[k]
        }), {})
    );
  };

  dismissError = (key) => this.dismissErrorList([key]);

  dismissAllErrors = () => this.dismissErrorList(this.getAllErrorKeys());

  retryErrorList = (keys = []) => {
    this.dismissErrorList(keys);

    this.errorQueue.removeKeys(keys);
    this.invalidateQueueUpdater();
  };

  retryError = (key) => this.retryErrorList([key]);

  retryAllErrors = () => this.retryErrorList(this.getAllErrorKeys());
}
