import type { ProjectNameAndRootFormat } from '@nx/devkit/src/generators/project-name-and-root-utils';
import type { Linter, LinterType } from '@nx/eslint';

export interface Schema {
  name: string;
  displayName?: string;
  style?: string;
  skipFormat?: boolean;
  directory?: string;
  projectNameAndRootFormat?: ProjectNameAndRootFormat;
  tags?: string;
  unitTestRunner: 'jest' | 'none'; // default is jest
  classComponent?: boolean;
  js?: boolean;
  linter: Linter | LinterType;
  setParserOptionsProject?: boolean;
  e2eTestRunner: 'cypress' | 'playwright' | 'detox' | 'none'; // default is cypress
  bundler: 'webpack' | 'vite'; // default is webpack
  install: boolean; // default is true
  skipPackageJson?: boolean; //default is false
  addPlugin?: boolean;
  nxCloudToken?: string;
}
