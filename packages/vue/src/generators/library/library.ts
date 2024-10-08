import {
  addProjectConfiguration,
  formatFiles,
  GeneratorCallback,
  joinPathFragments,
  runTasksInSerial,
  toJS,
  Tree,
  updateJson,
} from '@nx/devkit';
import { addTsConfigPath, initGenerator as jsInitGenerator } from '@nx/js';
import { vueInitGenerator } from '../init/init';
import { Schema } from './schema';
import { normalizeOptions } from './lib/normalize-options';
import { addLinting } from '../../utils/add-linting';
import { createLibraryFiles } from './lib/create-library-files';
import { extractTsConfigBase } from '../../utils/create-ts-config';
import componentGenerator from '../component/component';
import { addVite } from './lib/add-vite';
import { ensureDependencies } from '../../utils/ensure-dependencies';
import { logShowProjectCommand } from '@nx/devkit/src/utils/log-show-project-command';
import { getRelativeCwd } from '@nx/devkit/src/generators/artifact-name-and-directory-utils';
import { relative } from 'path';

export function libraryGenerator(tree: Tree, schema: Schema) {
  return libraryGeneratorInternal(tree, { addPlugin: false, ...schema });
}

export async function libraryGeneratorInternal(tree: Tree, schema: Schema) {
  const tasks: GeneratorCallback[] = [];

  const options = await normalizeOptions(tree, schema);
  if (options.publishable === true && !schema.importPath) {
    throw new Error(
      `For publishable libs you have to provide a proper "--importPath" which needs to be a valid npm package name (e.g. my-awesome-lib or @myorg/my-lib)`
    );
  }

  addProjectConfiguration(tree, options.name, {
    root: options.projectRoot,
    sourceRoot: joinPathFragments(options.projectRoot, 'src'),
    projectType: 'library',
    tags: options.parsedTags,
    targets: {},
  });

  tasks.push(await jsInitGenerator(tree, { ...schema, skipFormat: true }));
  tasks.push(
    await vueInitGenerator(tree, {
      ...options,
      skipFormat: true,
    })
  );
  if (!options.skipPackageJson) {
    tasks.push(ensureDependencies(tree, options));
  }

  extractTsConfigBase(tree);

  tasks.push(await addLinting(tree, options, 'lib'));

  createLibraryFiles(tree, options);

  tasks.push(await addVite(tree, options));

  if (options.component) {
    const relativeCwd = getRelativeCwd();
    const name = joinPathFragments(
      options.projectRoot,
      'src/lib',
      options.fileName
    );
    await componentGenerator(tree, {
      name: relativeCwd ? relative(relativeCwd, name) : name,
      nameAndDirectoryFormat: 'as-provided',
      skipTests:
        options.unitTestRunner === 'none' ||
        (options.unitTestRunner === 'vitest' && options.inSourceTests == true),
      export: true,
      routing: options.routing,
      js: options.js,
      inSourceTests: options.inSourceTests,
      skipFormat: true,
    });
  }

  if (options.publishable || options.bundler !== 'none') {
    updateJson(tree, `${options.projectRoot}/package.json`, (json) => {
      json.name = options.importPath;
      return json;
    });
  }

  if (!options.skipTsConfig) {
    addTsConfigPath(tree, options.importPath, [
      joinPathFragments(
        options.projectRoot,
        './src',
        'index.' + (options.js ? 'js' : 'ts')
      ),
    ]);
  }

  if (options.js) toJS(tree);

  if (!options.skipFormat) await formatFiles(tree);

  tasks.push(() => {
    logShowProjectCommand(options.name);
  });

  return runTasksInSerial(...tasks);
}

export default libraryGenerator;
