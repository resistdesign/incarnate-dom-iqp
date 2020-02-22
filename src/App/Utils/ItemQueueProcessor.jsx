import T from 'prop-types';
import React, {Component} from 'react';
import Incarnate, {LifePod} from 'incarnate-dom';
import Queue from './Queue';
import ItemQueueProcessorController from './ItemQueueProcessorController';

export default class ItemQueueProcessor extends Component {
  static propTypes = {
    ...Incarnate.propTypes,
    shared: T.shape({
      InputMap: T.string,
      OutputMap: T.string,
      ErrorMap: T.string,
      ItemProcessor: T.string
    }),
    batchSize: T.number,
    batchDelayMS: T.number
  };

  render() {
    const {
      batchSize = 5,
      batchDelayMS = 0,
      ...props
    } = this.props;

    return (
      <Incarnate
        {...props}
      >
        <LifePod
          name='Queue'
          factory={() => new Queue()}
        />
        <LifePod
          name='ErrorQueue'
          factory={() => new Queue()}
        />
        <LifePod
          name='QueueUpdater'
          dependencies={{
            queue: 'Queue',
            errorQueue: 'ErrorQueue',
            inputMap: 'InputMap'
          }}
          getters={{
            getInputMap: 'InputMap'
          }}
          factory={({queue, errorQueue, inputMap = {}, getInputMap}) => {
            const inputResolverMap = Object
              .keys(inputMap)
              .reduce((acc, k) => ({...acc, [k]: () => getInputMap(k)}), {});

            queue.addKeys(errorQueue.getMapWithoutQueued(inputResolverMap));

            return true;
          }}
        />
        <LifePod
          name='Processing'
          factory={() => false}
        />
        <LifePod
          name='QueueProcessor'
          dependencies={{
            itemProcessor: 'ItemProcessor',
            queue: 'Queue',
            errorQueue: 'ErrorQueue',
            // TRICKY: Watched but unused.
            inputMap: 'InputMap'
          }}
          getters={{
            getInputMap: 'InputMap',
            getOutputMap: 'OutputMap',
            getErrorMap: 'ErrorMap'
          }}
          setters={{
            setProcessing: 'Processing',
            setInputMap: 'InputMap',
            setOutputMap: 'OutputMap',
            setErrorMap: 'ErrorMap'
          }}
          strict
          factory={async ({
                            itemProcessor,
                            queue,
                            errorQueue,
                            getInputMap,
                            getOutputMap,
                            getErrorMap,
                            setProcessing,
                            setInputMap,
                            setOutputMap,
                            setErrorMap
                          }) => {
            await new Promise(res => setTimeout(res, batchDelayMS));

            const itemResolverMap = queue.getNValues(batchSize);
            const itemIdList = Object.keys(itemResolverMap);

            if (itemIdList.length > 0) {
              const process = async () => {
                const removedIds = [];
                const newOutputMap = {};
                const promises = [];
                const staleItemIds = [];

                setProcessing(true);
                for (let i = 0; i < itemIdList.length; i++) {
                  const id = itemIdList[i];
                  const itemRes = itemResolverMap[id];

                  promises.push(new Promise(
                    async res => {
                      try {
                        const item = itemRes();
                        const returnItem = await itemProcessor(item);
                        const itemIsStale = item !== itemRes();
                        const {
                          id: newId
                        } = returnItem;

                        if (!!itemIsStale) {
                          // TRICKY: IMPORTANT: The item may have changed since processing began,
                          // that means the processed item is now stale and should be queued again,
                          // NOT removed from the `InputMap`.
                          staleItemIds.push(id);
                        }

                        newOutputMap[newId] = returnItem;
                        removedIds.push(id);
                      } catch (error) {
                        // Set errors.
                        const errorMap = getErrorMap() || {};

                        setErrorMap({
                          ...errorMap,
                          [id]: error
                        });

                        errorQueue.addKeys({
                          [id]: true
                        });
                      }

                      res();
                    }
                  ));
                }

                await Promise.all(promises);
                setProcessing(false);

                const newInputMap = {
                  ...getInputMap()
                };

                removedIds.forEach(id => {
                  // IMPORTANT: Do not remove items that have changed from the `InputMap`;
                  if (staleItemIds.indexOf(id) === -1) {
                    delete newInputMap[id];
                  }
                });
                queue.removeKeys(itemResolverMap);
                setOutputMap({
                  ...getOutputMap(),
                  ...newOutputMap
                });
                setInputMap(newInputMap);
              };

              process();
            }

            return true;
          }}
        />
        <LifePod
          name='Controller'
          dependencies={{
            errorQueue: 'ErrorQueue'
          }}
          invalidators={{
            invalidateQueueUpdater: 'QueueUpdater'
          }}
          factory={(config) => new ItemQueueProcessorController(config)}
        />
      </Incarnate>
    );
  }
}
