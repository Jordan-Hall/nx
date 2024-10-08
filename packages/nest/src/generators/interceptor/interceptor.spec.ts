import type { Tree } from '@nx/devkit';
import { createTreeWithNestApplication } from '../utils/testing';
import type { InterceptorGeneratorOptions } from './interceptor';
import { interceptorGenerator } from './interceptor';

describe('interceptor generator', () => {
  let tree: Tree;
  const directory = 'api';
  const options: InterceptorGeneratorOptions = {
    name: 'test',
    directory,
    unitTestRunner: 'jest',
  };

  beforeEach(() => {
    tree = createTreeWithNestApplication(directory);
    jest.clearAllMocks();
  });

  it('should run successfully', async () => {
    await expect(interceptorGenerator(tree, options)).resolves.not.toThrow();
  });
});
