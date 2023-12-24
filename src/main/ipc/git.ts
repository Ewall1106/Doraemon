import { ipcMain } from 'electron';
import gitUrlParse from 'git-url-parse';
import fs from 'node:fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export const gitInit = () => {
  ipcMain.handle('git.urlParse', async (_event, args) => {
    const { url } = args;
    const parsedUrl = gitUrlParse(url);
    const { owner, name, resource, protocol } = parsedUrl;
    return { owner, name, resource, protocol };
  });

  ipcMain.handle('git.clone', async (_event, args) => {
    const { repoURL, targetDirectory } = args;

    try {
      await git.clone({ fs, http, dir: targetDirectory, url: repoURL });
      console.log('Git clone successful');
    } catch (error) {
      console.error('Error during git clone:', error);
    }
  });

  ipcMain.handle('git.pull', async (_event, args) => {
    const { targetDirectory } = args;
    try {
      await git.pull({
        fs,
        http,
        dir: targetDirectory,
        singleBranch: true,
        prune: true,
        // hack: 没有author信息无法拉取成功
        author: {
          name: 'Your Name',
          email: 'your.email@example.com',
        },
      });
      console.log('Git pull successful');
    } catch (error) {
      console.error('Error during git pull:', error);
    }
  });
};

export default gitInit;
