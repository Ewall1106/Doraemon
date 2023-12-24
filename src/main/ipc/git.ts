import { ipcMain } from 'electron';
import { simpleGit } from 'simple-git';
import gitUrlParse from 'git-url-parse';
import fs from 'node:fs';
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/node';

export const gitInit = () => {
  ipcMain.handle('git.urlParse', async (event, args) => {
    const { url } = args;
    const parsedUrl = gitUrlParse(url);
    const { owner, name, resource, protocol } = parsedUrl;
    return { owner, name, resource, protocol };
  });

  ipcMain.handle('git.clone', async (event, args) => {
    const { repoURL, targetDirectory } = args;
    // const git = simpleGit();

    // const dir = path.join(process.cwd(), 'test-clone');
    // .then(console.log);

    try {
      // await git.clone(repoURL, targetDirectory);
      await git.clone({ fs, http, dir: targetDirectory, url: repoURL });
      console.log('Git clone successful');
    } catch (error) {
      console.error('Error during git clone:', error);
    }
  });

  ipcMain.handle('git.pull', async (event, args) => {
    const { targetDirectory } = args;
    const git = simpleGit(targetDirectory);

    try {
      await git.reset(['--hard']);
      await git.pull();
      console.log('Git pull successful');
    } catch (error) {
      console.error('Error during git pull:', error);
    }
  });
};

export default gitInit;
