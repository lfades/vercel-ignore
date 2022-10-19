# vercel-ignore

To get started, add the following command as your [Ignored Build Step](https://vercel.com/docs/concepts/projects/overview#ignored-build-step) to skip builds if no changes happened in the [Root Directory](https://vercel.com/docs/concepts/deployments/configure-a-build#root-directory):

```bash
npx vercel-ignore
```

The command executes `git diff` to compare the changes between the commit in the last successful deployment and the current one.

This is intended for projects that have a [Root Directory](https://vercel.com/docs/concepts/deployments/configure-a-build#root-directory) configured and are not under a monorepo. **If you're using a Monorepo please use [turbo-ignore](https://github.com/vercel/turborepo/tree/main/packages/turbo-ignore) instead**.

## Usage

```bash
npx vercel-ignore [paths...]
```

Executing `vercel-ignore` without any paths will run the following command:

```bash
git diff --quiet <last-sha> HEAD -- .
```

Where `<last-sha>` is the last successful deployment's commit SHA and `.` will look for matches in the working directory, which is the [Root Directory](https://vercel.com/docs/concepts/deployments/configure-a-build#root-directory) set in settings.

If you want to ignore changes for different paths, you can pass them as arguments:

```bash
npx vercel-ignore :/examples/hello-world :/examples/hello-world-typescript
```

The command above will execute:

```bash
git diff --quiet <last-sha> HEAD -- :/examples/hello-world :/examples/hello-world-typescript
```

Where `:/` is a [top magic signature](https://css-tricks.com/git-pathspecs-and-how-to-use-them/#aa-top) to start the match from the git root. Otherwise the match will happen relative to the working directory.

## FAQ

#### When should I use this?

If your repo has multiple, independent projects that can't be in a monorepo, like is the case for the [Vercel Examples](https://github.com/vercel/examples) repository, you can use this to skip builds for projects that didn't change.

#### Should I use this instead of turbo-ignore?

No. If your project is part of a monorepo you should use [turbo-ignore](https://github.com/vercel/turborepo/tree/main/packages/turbo-ignore) instead.
