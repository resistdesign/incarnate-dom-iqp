import './App/Assets/Fonts/Gasalt/stylesheet.css';
import {hot} from 'react-hot-loader';
import React, {Component, Fragment} from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import Incarnate, {LifePod} from 'incarnate-dom';
import UUIDV4 from 'uuid/v4';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  CardMedia,
  CardActionArea,
  CssBaseline,
  Typography, Box
} from '@material-ui/core';
import {
  createMuiTheme,
  ThemeProvider
} from '@material-ui/core/styles';
import SRACLMUITheme from '@resistdesign/sracl-mui-theme';
import {Light as SyntaxHighlighter} from 'react-syntax-highlighter';
import {hybrid} from 'react-syntax-highlighter/dist/esm/styles/hljs';
import JSONLanguage from 'react-syntax-highlighter/dist/esm/languages/hljs/json';
import {ItemQueueProcessor} from './index';
import Logo from './App/Assets/Graphics/zap-logo.svg';

SyntaxHighlighter.registerLanguage('json', JSONLanguage);

const THEME = createMuiTheme(SRACLMUITheme);
const GlobalStyle = createGlobalStyle`
  html,
  body,
  #app-root {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
  }
`;
const Base = styled(Box)`
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
`;
const HeaderBox = styled(Box)`
  box-sizing: border-box;
  padding: 2em;
`;
const LogoImg = styled.img`
  width: 7.5em;
`;
const Title = styled(Typography).attrs(p => ({
  ...p,
  style: {
    ...p.style,
    fontFamily: 'gasaltblack, sans-serif',
    letterSpacing: '0.05em'
  }
}))`
  
`;
const Area = styled.div`
  padding: 2em;
`;
const SectionGrid = styled(Area)`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 4em;
  box-sizing: border-box;
  
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;
const SubSectionBox = styled.div`
  padding: 1em;
`;
const RowBox = styled(SubSectionBox)`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: flex-start;
  grid-gap: 1em;
`;
const Section = ({title = '', children, ...props} = {}) => (
  <Box
    {...props}
  >
    {!!title ? (<Typography variant='h6'>{title}</Typography>) : undefined}
    {children}
  </Box>
);
const SubSection = ({title = '', children, ...props} = {}) => (
  <SubSectionBox
    {...props}
  >
    {!!title ? (<Typography>{title}</Typography>) : undefined}
    {children}
  </SubSectionBox>
);

const PROCESSING_COUNT_MAP = {};

export class App extends Component {
  static propTypes = {};

  render() {
    return (
      <Incarnate
        name='ItemQueueProcessorDemo'
      >
        <Fragment>
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
              () => {
                PROCESSING_COUNT_MAP[id] = typeof PROCESSING_COUNT_MAP[id] === 'number' ?
                  PROCESSING_COUNT_MAP[id] + 1 :
                  1;

                return Math.random() < 0.25 ?
                  rej(new Error('Unknown Error')) :
                  res({
                    id: `SAVED_${id}`,
                    processedXTimes: PROCESSING_COUNT_MAP[id],
                    parentItemID,
                    ...item
                  });
              },
              2500
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
            name='ErrorMap'
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
              ItemProcessor: 'ItemProcessor',
              ErrorMap: 'ErrorMap'
            }}
            batchSize={3}
            batchDelayMS={1500}
          />
        </Fragment>
        <Fragment>
          <GlobalStyle/>
          <ThemeProvider
            theme={THEME}
          >
            <CssBaseline/>
            <Base
              display='flex'
              flexDirection='column'
              alignItems='stretch'
              justifyContent='flex-start'
            >
              <HeaderBox
                display='flex'
                flexDirection='row'
                alignItems='center'
                justifyContent='flex-start'
              >
                <LogoImg
                  src={Logo}
                />
                <Title
                  variant='h5'
                >
                  Incarnate DOM <Title display='inline' variant='h5' color='textSecondary'>Item Queue Processor</Title>
                </Title>
              </HeaderBox>
              <Area>
                <Section>
                  <SubSection>
                    <Card>
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

                            if (Math.random() < 0.4) {
                              // Make it stale. (Mmmmmmmm, it's like late night fries!)
                              setTimeout(() => setMap({
                                ...item,
                                note: 'Updated mid-processing'
                              }, id), Math.random() * 2000);
                            }
                          }
                        })}
                      >
                        <CardActionArea>
                          <CardHeader>
                            Add Item
                          </CardHeader>
                        </CardActionArea>
                      </LifePod>
                    </Card>
                  </SubSection>
                </Section>
              </Area>
              <SectionGrid>
                <Section>
                  <SubSection>
                    <h3>Map</h3>
                    <LifePod
                      dependencies={{
                        map: 'Map'
                      }}
                    >
                      {({map}) => (
                        <SyntaxHighlighter
                          language='json'
                          style={hybrid}
                        >
                          {JSON.stringify(map, null, '  ')}
                        </SyntaxHighlighter>
                      )}
                    </LifePod>
                  </SubSection>
                  <SubSection>
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
                  </SubSection>
                  <SubSection>
                    <h3>Existing</h3>
                    <LifePod
                      dependencies={{
                        existing: 'Existing'
                      }}
                    >
                      {({existing}) => (
                        <SyntaxHighlighter
                          language='json'
                          style={hybrid}
                        >
                          {JSON.stringify(existing, null, '  ')}
                        </SyntaxHighlighter>
                      )}
                    </LifePod>
                  </SubSection>
                </Section>
                <Section>
                  <SubSection>
                    <LifePod
                      dependencies={{
                        errorMap: 'ErrorMap',
                        mapQueueProcessorController: 'MapQueueProcessor.Controller'
                      }}
                      mapToProps={p => p}
                    >
                      {({errorMap = {}, mapQueueProcessorController}) => {
                        const errorKeyList = Object.keys(errorMap);

                        return (
                          <div>
                            <h5>{errorKeyList.length} Errors</h5>
                            <ul>
                              {errorKeyList.map(k => (
                                <li key={`Message:${k}`}>
                                  {k}:&nbsp;{errorMap[k] && errorMap[k].message}
                                  &nbsp;
                                  <button
                                    onClick={() => mapQueueProcessorController.dismissError(k)}
                                  >
                                    Dismiss
                                  </button>
                                  &nbsp;
                                  <button
                                    onClick={() => mapQueueProcessorController.retryError(k)}
                                  >
                                    Retry
                                  </button>
                                  &nbsp;
                                  <button
                                    onClick={() => mapQueueProcessorController.dismissError(k, true)}
                                  >
                                    Cancel
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      }}
                    </LifePod>
                  </SubSection>
                </Section>
              </SectionGrid>
            </Base>
          </ThemeProvider>
        </Fragment>
      </Incarnate>
    );
  }
}

export default hot(module)(App);
