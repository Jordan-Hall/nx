import 'nx/src/internal-testing-utils/mock-project-graph';

import { createApp, createLib } from '../../utils/testing-generators';
import { logger, Tree } from '@nx/devkit';
import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { hookGenerator } from './hook';

describe('hook', () => {
  let appTree: Tree;
  let projectName: string;

  beforeEach(async () => {
    projectName = 'my-lib';
    appTree = createTreeWithEmptyWorkspace();
    await createApp(appTree, 'my-app');
    await createLib(appTree, projectName);
    jest.spyOn(logger, 'warn').mockImplementation(() => {});
    jest.spyOn(logger, 'debug').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should generate files', async () => {
    await hookGenerator(appTree, {
      name: 'use-form',
      directory: `${projectName}/src/lib/use-form`,
    });

    expect(appTree.exists('my-lib/src/lib/use-form/use-form.ts')).toBeTruthy();
    expect(
      appTree.exists('my-lib/src/lib/use-form/use-form.spec.tsx')
    ).toBeTruthy();
  });

  it('should generate files for an app', async () => {
    await hookGenerator(appTree, {
      name: 'use-form',
      directory: 'my-app/src/app/use-form',
    });

    expect(appTree.exists('my-app/src/app/use-form/use-form.ts')).toBeTruthy();
    expect(
      appTree.exists('my-app/src/app/use-form/use-form.spec.tsx')
    ).toBeTruthy();
  });

  it('handles "use" in the name', async () => {
    await hookGenerator(appTree, {
      name: 'use-hello',
      directory: `${projectName}/src/lib/use-hello`,
      skipTests: true,
    });

    expect(
      appTree.exists('my-lib/src/lib/use-hello/use-hello.ts')
    ).toBeTruthy();
    expect(
      appTree.exists('my-lib/src/lib/use-hello/use-hello.spec.tsx')
    ).toBeFalsy();
  });

  it('handles "use-" in the name', async () => {
    await hookGenerator(appTree, {
      name: 'use-hello',
      directory: `${projectName}/src/lib/use-hello`,
      skipTests: true,
    });
    expect(
      appTree.exists('my-lib/src/lib/use-hello/use-hello.ts')
    ).toBeTruthy();
    expect(
      appTree.exists('my-lib/src/lib/use-hello/use-hello.spec.tsx')
    ).toBeFalsy();
  });

  describe('--export', () => {
    it('should add to index.ts barrel', async () => {
      await hookGenerator(appTree, {
        name: 'hello',
        directory: `${projectName}/src/lib/use-hello`,
        export: true,
      });

      const indexContent = appTree.read('my-lib/src/index.ts', 'utf-8');

      expect(indexContent).toMatch(/lib\/use-hello/);
    });

    it('should not export from an app', async () => {
      await hookGenerator(appTree, {
        name: 'hello',
        directory: 'my-lib/src/app/use-hello',
        export: true,
      });

      const indexContent = appTree.read('my-lib/src/index.ts', 'utf-8');

      expect(indexContent).not.toMatch(/lib\/use-hello/);
    });
  });

  describe('--skipTests', () => {
    it('should not generate tests', async () => {
      await hookGenerator(appTree, {
        name: 'use-hello',
        directory: `${projectName}/src/lib/use-hello`,
        skipTests: true,
      });
      expect(
        appTree.exists('my-lib/src/lib/use-hello/use-hello.ts')
      ).toBeTruthy();
      expect(
        appTree.exists('my-lib/src/lib/use-hello/use-hello.spec.tsx')
      ).toBeFalsy();
    });
  });

  describe('--directory', () => {
    it('should create component under the directory', async () => {
      await hookGenerator(appTree, {
        name: 'use-hello',
        directory: 'my-lib/src/hooks/use-hello',
        skipTests: true,
      });

      expect(appTree.exists('/my-lib/src/hooks/use-hello/use-hello.ts'));
    });

    it('should create with nested directories', async () => {
      await hookGenerator(appTree, {
        name: 'use-hello-world',
        directory: `${projectName}/src/lib/foo/use-hello-world`,
        skipTests: true,
      });

      expect(
        appTree.exists('/my-lib/src/lib/foo/use-hello-world/use-hello-world.ts')
      );
    });
  });
});
