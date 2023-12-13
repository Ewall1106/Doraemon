import React, { useRef, useEffect } from 'react';
import { Button } from '@mantine/core';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';

import 'xterm/css/xterm.css';
import styles from './styles.module.scss';

export default function Home() {
  const terminalRef = useRef(null);

  const handleInstall = () => {
    window.electron.ipcRenderer.sendMessage('ipc-dialog-open');

    window.electron.ipcRenderer.once('ipc-dialog-open', (filePaths) => {
      const filePath = filePaths?.[0];
      console.log(filePath);
    });
  };

  useEffect(() => {
    const terminal = new Terminal();
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    // Load the WebLinksAddon and attach a handler for link clicks
    const webLinksAddon = new WebLinksAddon((event, uri) => {
      // Open the link in the default web browser
      // TODO:
      // window.electron.shell.openExternal(uri);
      console.log('>>>>>>>', uri);
    });
    terminal.loadAddon(webLinksAddon);
    terminal.open(terminalRef.current);
    fitAddon.fit();

    terminal.write('$ https://zhuzhukeji.com');

    return () => {
      terminal.dispose();
    };
  }, []);

  return (
    <div className={styles.home}>
      <Button variant="filled" onClick={handleInstall}>
        安装
      </Button>
      <div>11111111</div>
      <div ref={terminalRef} style={{ height: '200px' }} />
    </div>
  );
}
