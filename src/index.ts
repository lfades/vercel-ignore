#!/usr/bin/env node

import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(_exec);
const prevSha = process.env.VERCEL_GIT_PREVIOUS_SHA;
const paths = process.argv.slice(2);

if (!prevSha) {
  console.log('> No previous SHA found for this project to compare against');
  console.log(`> Proceeding with build...`);
  process.exit(1);
}

console.log(
  '> Comparing the GIT SHA to see if this project is affected by the commit...'
);

async function hasProjectChanged(): Promise<boolean> {
  if (!paths.length) {
    // This step is not really needed but it helps with providing better
    // error messages in case the user forgets to set the Root Directory
    // setting in Vercel.
    const relativePath = await exec('git rev-parse --show-prefix');

    if (relativePath.stderr) {
      throw new Error(`\`git rev-parse\` failed with: ${relativePath.stderr}`);
    }

    const dir = relativePath.stdout.trim();

    if (!dir) {
      console.log(
        '> No subdirectory found for this project. Either the "Root Directory" setting is missing or a path should be added like this: \n' +
          '\nnpx vercel-git-ignore <my-directory>\n'
      );
      console.log(`> Proceeding with build...`);
      return true;
    }
  }

  try {
    // When there's no path set, use `.` so that the the diff returns changes in
    // the current directory.
    const command = `git diff --quiet ${prevSha} HEAD -- ${
      paths.length ? paths.join(' ') : '.'
    }`;

    console.log('> Running:', command);
    await exec(command);

    // If no error is thrown (code 0) then there were no files changed
    console.log('> No files changed between the commit SHAs');
    console.log('> Skipping build.');
    return false;
  } catch (error: any) {
    if (error.code === 1 && !error.stderr) {
      console.log(
        paths.length
          ? `> Found a matching change for: "${paths.join('", "')}"`
          : '> Found a change in the Root Directory'
      );
      console.log('> Proceeding with build...');
      return true;
    }

    console.log(error);
    throw new Error(`\n\`git diff\` failed with: ${error.stderr}`);
  }
}

hasProjectChanged()
  .then((changed) => {
    process.exit(changed ? 0 : 1);
  })
  .catch((error) => {
    console.error('> An error occurred while comparing the commits:');
    console.error(error.message);
    console.error('> Proceeding with build to be safe...');
    process.exit(1);
  });
