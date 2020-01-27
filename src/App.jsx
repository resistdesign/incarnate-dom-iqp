import {hot} from 'react-hot-loader';
import React, {Component} from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import Incarnate, {LifePod} from 'incarnate-dom';
import UUIDV4 from 'uuid/v4';
import Queue from './App/Utils/Queue';

const GlobalStyle = createGlobalStyle`
html,
body,
#app-root {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  font-family: sans-serif;
}
`;
const Base = styled.div`
  
`;
const Row = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: stretch;
`;
const DisplayBox = styled.div`
  flex: 1 0 auto;
  margin: 1em;
  border: solid 0.05em darkgray;
  background-color: lightgray;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-height: 25em;
  overflow: auto;
`;
const DisplayButton = styled(DisplayBox)`
  cursor: pointer;
  user-select: none;
  border-radius: 1em;
  justify-content: center;
  
  &:hover {
    background-color: #fefefe;
  }
  
  &:active {
    background-color: #333333;
  }
`;

export class App extends Component {
  static propTypes = {};

  render() {
    return (
      <Base>
        <GlobalStyle/>
        <Incarnate
          name='TransformPairs'
        >
          <LifePod
            name='RunningCount'
            factory={() => 0}
          />
          <LifePod
            name='ProcessingRequests'
            factory={() => false}
          />
          <LifePod
            name='Map'
            factory={() => ({})}
          />
          <LifePod
            name='Queue'
            factory={() => new Queue()}
          />
          <LifePod
            name='Existing'
            factory={() => ({})}
          />
          <LifePod
            name='UpdateQueue'
            dependencies={{
              queue: 'Queue',
              map: 'Map'
            }}
            factory={({queue, map = {}}) => {
              queue.addKeys(map);

              return true;
            }}
          />
          <LifePod
            name='ProcessQueue'
            dependencies={{
              queue: 'Queue',
              map: 'Map'
            }}
            getters={{
              getMap: 'Map',
              getExisting: 'Existing'
            }}
            setters={{
              setProcessingRequests: 'ProcessingRequests',
              setMap: 'Map',
              setExisting: 'Existing'
            }}
            factory={({
                        queue,
                        getMap,
                        getExisting,
                        setProcessingRequests,
                        setMap,
                        setExisting
                      }) => {
              const valuesToProcess = queue.getNValues(5);
              const valueKeys = Object.keys(valuesToProcess);

              if (valueKeys.length > 0) {
                const process = async () => {
                  const removedKeys = [];
                  const existingMap = {};

                  setProcessingRequests(true);
                  for (let i = 0; i < valueKeys.length; i++) {
                    const k = valueKeys[i];
                    const v = valuesToProcess[k];

                    await new Promise(res => setTimeout(res, 1500));
                    existingMap[k] = v;

                    removedKeys.push(k);
                  }
                  setProcessingRequests(false);

                  const newMap = {
                    ...getMap()
                  };

                  removedKeys.forEach(k => {
                    delete newMap[k];
                  });

                  queue.removeKeys(valuesToProcess);
                  setExisting({
                    ...getExisting(),
                    ...existingMap
                  });
                  setMap(newMap);
                };

                process();
              }

              return true;
            }}
          />
          <Row>
            <LifePod
              getters={{
                getRunningCount: 'RunningCount'
              }}
              setters={{
                setRunningCount: 'RunningCount',
                setMap: 'Map'
              }}
              mapToProps={({
                             getRunningCount,
                             setRunningCount,
                             setMap
                           }) => ({
                onClick: () => {
                  const id = UUIDV4();
                  const item = {
                    id,
                    properties: {},
                    content: `I'm an item!`
                  };

                  setRunningCount(getRunningCount() + 1);

                  setMap(item, id);
                }
              })}
            >
              <DisplayButton>
                <h3>Add Item</h3>
              </DisplayButton>
            </LifePod>
          </Row>
          <Row>
            <DisplayBox>
              <h3>Map</h3>
              <LifePod
                dependencies={{
                  map: 'Map'
                }}
              >
                {({map}) => (
                  <pre>{JSON.stringify(map, null, '  ')}</pre>
                )}
              </LifePod>
            </DisplayBox>
            <DisplayBox>
              <h3>Processing Queue</h3>
              <LifePod
                dependencies={{
                  runningCount: 'RunningCount',
                  processingRequests: 'ProcessingRequests',
                  existing: 'Existing'
                }}
              >
                {({runningCount, processingRequests, existing = {}}) => (
                  <span>
                    {!processingRequests ? 'No' : 'Yes'}<br/>
                    Created: {Object.keys(existing).length} out of {runningCount}
                  </span>
                )}
              </LifePod>
            </DisplayBox>
            <DisplayBox>
              <h3>Existing</h3>
              <LifePod
                dependencies={{
                  existing: 'Existing'
                }}
              >
                {({existing}) => (
                  <pre>{JSON.stringify(existing, null, '  ')}</pre>
                )}
              </LifePod>
            </DisplayBox>
          </Row>
        </Incarnate>
      </Base>
    );
  }
}

export default hot(module)(App);
