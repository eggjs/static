import type { ILifecycleBoot, EggCore } from '@eggjs/core';

export default class AppBoot implements ILifecycleBoot {
  private readonly app;
  constructor(app: EggCore) {
    this.app = app;
  }
  async configWillLoad() {
    const app = this.app;
    // make sure static middleware is before bodyParser
    const index = app.config.coreMiddleware.indexOf('bodyParser');
    if (index === -1) {
      app.config.coreMiddleware.push('static');
    } else {
      app.config.coreMiddleware.splice(index, 0, 'static');
    }
  }
}
