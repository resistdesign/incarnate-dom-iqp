import {hot} from 'react-hot-loader';
import React, {Component} from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import Incarnate, {LifePod} from 'incarnate-dom';
import UUIDV4 from 'uuid/v4';
import ItemQueueProcessor from './App/Utils/ItemQueueProcessor';

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
  
  & > h3 {
    position: sticky;
    top: 1em;
    margin: 0.5em;
    padding: 0.5em;
    background-color: lightgray;
    border-radius: 1em;
  }
`;
const DisplayButton = styled(DisplayBox)`
  cursor: pointer;
  user-select: none;
  border-radius: 1em;
  justify-content: center;
  
  & > h3 {
    background-color: unset;
  }
  
  &:hover {
    background-color: #fefefe;
  }
  
  &:active {
    background-color: #333333;
    color: #ffffff;
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
            name='ParentItemID'
            factory={() => UUIDV4()}
          />
          <LifePod
            name='ItemProcessor'
            dependencies={{
              parentItemID: 'ParentItemID'
            }}
            strict
            factory={({parentItemID}) => async ({id, ...item} = {}) => await new Promise((res, rej) => setTimeout(
              () => Math.random() < 0.3 ?
                rej(new Error('Unknown Error')) :
                res({
                  id: `SAVED_${id}`,
                  parentItemID,
                  ...item
                }),
              1500
            ))}
          />
          <LifePod
            name='RunningCount'
            factory={() => 0}
          />
          <LifePod
            name='Map'
            factory={() => ({})}
          />
          <LifePod
            name='Existing'
            factory={() => ({})}
          />
          <ItemQueueProcessor
            name='MapQueueProcessor'
            shared={{
              InputMap: 'Map',
              OutputMap: 'Existing',
              ItemProcessor: 'ItemProcessor'
            }}
            batchSize={3}
            batchDelayMS={1500}
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
                  processingRequests: 'MapQueueProcessor.Processing',
                  existing: 'Existing'
                }}
              >
                {({runningCount, processingRequests, existing = {}}) => (
                  <span>
                    {!!processingRequests ? 'Yes' : 'No'}<br/>
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
