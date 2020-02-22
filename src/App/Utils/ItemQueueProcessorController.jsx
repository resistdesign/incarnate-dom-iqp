export default class ItemQueueProcessorController {
  /**
   * @type {Queue}
   * */
  errorQueue;

  /**
   * @type {Function}
   * */
  getInputMap;

  /**
   * @type {Function}
   * */
  getErrorMap;

  /**
   * @type {Function}
   * */
  setInputMap;

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

  getNewInputMap = () => ({...this.getInputMap()});

  getAllInputKeys = () => Object.keys(this.getNewInputMap());

  getNewErrorMap = () => ({...this.getErrorMap()});

  getAllErrorKeys = () => Object.keys(this.getNewErrorMap());

  dismissErrorList = (keys = [], cancelItems = false) => {
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

    if (!!cancelItems) {
      const newInputMap = this.getNewInputMap();

      this.setInputMap(
        Object
          .keys(newInputMap)
          .filter(k => keys.indexOf(k) === -1)
          .reduce((acc, k) => ({
            ...acc,
            [k]: newInputMap[k]
          }), {})
      );
    }
  };

  dismissError = (key, cancelItem = false) => this.dismissErrorList([key], cancelItem);

  dismissAllErrors = (cancelItems = false) => this.dismissErrorList(this.getAllErrorKeys(), cancelItems);

  retryErrorList = (keys = []) => {
    this.dismissErrorList(keys);

    this.errorQueue.removeKeys(keys);
    this.invalidateQueueUpdater();
  };

  retryError = (key) => this.retryErrorList([key]);

  retryAllErrors = () => this.retryErrorList(this.getAllErrorKeys());
}
