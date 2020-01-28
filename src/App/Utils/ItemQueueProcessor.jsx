import T from 'prop-types';
import React, {Component, Fragment} from 'react';
import Incarnate, {LifePod} from 'incarnate-dom';
import Queue from './Queue';

export default class ItemQueueProcessor extends Component {
  static propTypes = {
    ...Incarnate.propTypes,
    shared: T.shape({
      InputMap: T.string,
      OutputMap: T.string,
      ItemProcessor: T.string
    }),
    batchSize: T.number
  };

  render() {
    const {
      batchSize = 5,
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
          name='QueueUpdater'
          dependencies={{
            queue: 'Queue',
            inputMap: 'InputMap'
          }}
          factory={({queue, inputMap = {}}) => {
            queue.addKeys(inputMap);

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
            // TRICKY: Watched but unused.
            inputMap: 'InputMap'
          }}
          getters={{
            getInputMap: 'InputMap',
            getOutputMap: 'OutputMap'
          }}
          setters={{
            setProcessing: 'Processing',
            setInputMap: 'InputMap',
            setOutputMap: 'OutputMap'
          }}
          strict
          factory={({
                      itemProcessor,
                      queue,
                      getInputMap,
                      getOutputMap,
                      setProcessing,
                      setInputMap,
                      setOutputMap
                    }) => {
            const itemsToProcess = queue.getNValues(batchSize);
            const itemIdList = Object.keys(itemsToProcess);

            if (itemIdList.length > 0) {
              const process = async () => {
                const removedIds = [];
                const newOutputMap = {};
                const promises = [];

                setProcessing(true);
                for (let i = 0; i < itemIdList.length; i++) {
                  const id = itemIdList[i];
                  const item = itemsToProcess[id];

                  promises.push(new Promise(
                    async res => {
                      try {
                        const returnItem = await itemProcessor(item);
                        const {
                          id: newId
                        } = returnItem;

                        newOutputMap[newId] = returnItem;
                        removedIds.push(id);
                      } catch (error) {
                        // Ignore.
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
                  delete newInputMap[id];
                });
                queue.removeKeys(itemsToProcess);
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
      </Incarnate>
    );
  }
}
