import './App/Assets/Fonts/Gasalt/stylesheet.css';
import {hot} from 'react-hot-loader';
import React, {Component, Fragment} from 'react';
import styled, {createGlobalStyle} from 'styled-components';
import Incarnate, {LifePod} from 'incarnate-dom';
import UUIDV4 from 'uuid/v4';
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardHeader,
  CardContent,
  CardMedia,
  CssBaseline,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction, LinearProgress
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
import Logo from './App/Assets/Graphics/Incarnate Logo Icon 2020.svg';
import GHRepo from './App/Assets/Graphics/github-repo.svg';
import GHRepoMessage from './App/Assets/Graphics/github-repo-message.svg';

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
const GHRepoMessageCornerImg = styled.img`
  width: 10em;
`;
const GHRepoCornerImg = styled.img`
  width: 10em;
  margin-left: -10em;
`;
const GHRepoAnchor = styled.a`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: flex-start;

  & > ${GHRepoMessageCornerImg} {
    width: 5em;
    
    transition: width 100ms ease-in-out;
  }
  
  &:hover {
    & > ${GHRepoMessageCornerImg} {
      width: 10em;
    }
  }
`;
const GHRepoCorner = styled.div`
  position: absolute;
  top: 0;
  right: 0;
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
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: stretch;
  padding: 1em;
  
  & > * {
    flex: 10 auto;
  }
`;
const RowBox = styled(SubSectionBox)`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: flex-start;
  grid-gap: 1em;
`;
const CodeBox = styled.div`
  max-height: 15em;
  overflow: auto;
`;
const Section = ({title = '', children, ...props} = {}) => (
  <Box
    display='flex'
    flexDirection='column'
    alignItems='stretch'
    justifyContent='stretch'
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
              <SectionGrid>
                <Section>
                  <SubSection>
                    <Card>
                      <CardMedia
                        title='Add Item'
                        image='https://resist.design/Console%20BG%202.jpg'
                      >
                        <Box
                          width='100%'
                          height='15em'
                          display='flex'
                          alignItems='center'
                          justifyContent='center'
                        >
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
                            <Button
                              variant='contained'
                              color='primary'
                              size='large'
                            >
                              Add Item
                            </Button>
                          </LifePod>
                        </Box>
                      </CardMedia>
                      <CardHeader
                        title='Map'
                      />
                      <CardContent>
                        <LifePod
                          dependencies={{
                            map: 'Map'
                          }}
                        >
                          {({map}) => (
                            <CodeBox>
                              <SyntaxHighlighter
                                language='json'
                                style={hybrid}
                                showLineNumbers
                                wrapLines
                              >
                                {JSON.stringify(map, null, '  ')}
                              </SyntaxHighlighter>
                            </CodeBox>
                          )}
                        </LifePod>
                      </CardContent>
                    </Card>
                  </SubSection>
                </Section>
                <Section>
                  <SubSection>
                    <Card
                      style={{
                        flex: '0 0 auto',
                        width: '15em',
                        height: '15em',
                        margin: 'auto'
                      }}
                    >
                      <CardHeader
                        title='Processing Queue'
                      />
                      <LifePod
                        dependencies={{
                          processingRequests: 'MapQueueProcessor.Processing',
                        }}
                        mapToProps={p => p}
                      >
                        {({processingRequests = false} = {}) => processingRequests ? (
                          <LinearProgress
                            color='secondary'
                          />
                        ) : (
                          <LinearProgress
                            variant='determinate'
                            color='secondary'
                            value={0}
                          />
                        )}
                      </LifePod>
                      <LifePod
                        dependencies={{
                          runningCount: 'RunningCount',
                          existing: 'Existing'
                        }}
                      >
                        {({runningCount, existing = {}}) => (
                          <Fragment>
                            <CardContent>
                              <Box
                                width='100%'
                                display='flex'
                                flexDirection='column'
                                alignItems='center'
                                justifyContent='center'
                              >
                                <Typography
                                  variant='h2'
                                  color='secondary'
                                >
                                  {Object.keys(existing).length}/{runningCount}
                                </Typography>
                              </Box>
                            </CardContent>
                          </Fragment>
                        )}
                      </LifePod>
                    </Card>
                  </SubSection>
                </Section>
                <Section>
                  <SubSection>
                    <Card>
                      <CardHeader
                        title='Existing'
                      />
                      <CardContent>
                        <LifePod
                          dependencies={{
                            existing: 'Existing'
                          }}
                        >
                          {({existing}) => (
                            <CodeBox>
                              <SyntaxHighlighter
                                language='json'
                                style={hybrid}
                                showLineNumbers
                                wrapLines
                              >
                                {JSON.stringify(existing, null, '  ')}
                              </SyntaxHighlighter>
                            </CodeBox>
                          )}
                        </LifePod>
                      </CardContent>
                    </Card>
                  </SubSection>
                </Section>
              </SectionGrid>
              <Area>
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
                          <Card>
                            <CardHeader
                              title={`${errorKeyList.length} Error${errorKeyList.length === 1 ? '' : 's'}`}
                              style={{
                                opacity: errorKeyList.length > 0 ? 1 : 0.5
                              }}
                            />
                            {errorKeyList.length > 0 ? (
                              <List>
                                {errorKeyList.map(k => (
                                  <ListItem
                                    key={`Message:${k}`}
                                  >
                                    <ListItemText
                                      primary={k}
                                      secondary={errorMap[k] && errorMap[k].message}
                                    />
                                    <ListItemSecondaryAction>
                                      <ButtonGroup
                                        variant='outlined'
                                        color='secondary'
                                      >
                                        <Button
                                          onClick={() => mapQueueProcessorController.retryError(k)}
                                        >
                                          Retry
                                        </Button>
                                        <Button
                                          onClick={() => mapQueueProcessorController.dismissError(k)}
                                        >
                                          Dismiss
                                        </Button>
                                        <Button
                                          onClick={() => mapQueueProcessorController.dismissError(k, true)}
                                        >
                                          Cancel
                                        </Button>
                                      </ButtonGroup>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                ))}
                              </List>
                            ) : undefined}
                          </Card>
                        );
                      }}
                    </LifePod>
                  </SubSection>
                </Section>
              </Area>
              <GHRepoCorner>
                <GHRepoAnchor
                  target='_blank'
                  href='https://github.com/resistdesign/incarnate-dom-iqp'
                >
                  <GHRepoMessageCornerImg
                    src={GHRepoMessage}
                  />
                  <GHRepoCornerImg
                    src={GHRepo}
                  />
                </GHRepoAnchor>
              </GHRepoCorner>
            </Base>
          </ThemeProvider>
        </Fragment>
      </Incarnate>
    );
  }
}

export default hot(module)(App);
