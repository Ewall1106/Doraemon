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
    await git.clone({ fs, http, dir: targetDirectory, url: repoURL });
  });

  ipcMain.handle('git.pull', async (_event, args) => {
    const { targetDirectory } = args;

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
  });
};

export default gitInit;
