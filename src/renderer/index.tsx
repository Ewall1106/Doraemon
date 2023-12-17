import { createRoot } from 'react-dom/client';
import { MantineProvider, createTheme } from '@mantine/core';
import App from './pages/app';

import './index.css';
import '@mantine/core/styles.css';

const theme = createTheme({
  /** Put your mantine theme override here */
});

const container = document.getElementById('root') as HTMLElement;
const root = createRoot(container);
root.render(
  <MantineProvider theme={theme}>
    <App />
  </MantineProvider>,
);
