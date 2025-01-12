import path from 'node:path';
import type { EggAppInfo } from '@eggjs/core';
import type { StaticConfig } from '../types.js';

export default (appInfo: EggAppInfo) => {
  return {
    static: {
      prefix: '/public/',
      dir: path.join(appInfo.baseDir, 'app/public'),
      // dirs: [ dir1, dir2 ] or [ dir1, { prefix: '/static2', dir: dir2 } ],
      dirs: undefined,
      // support lazy load
      dynamic: true,
      preload: false,
      buffer: false,
      maxFiles: 1000,
    } as StaticConfig,
  };
};
