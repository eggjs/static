import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import { mock, MockApplication } from '@eggjs/mock';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function getFixtures(filename: string) {
  return path.join(__dirname, 'fixtures', filename);
}

describe('test/static.test.ts', () => {
  describe('serve public', () => {
    let app: MockApplication;
    before(() => {
      app = mock.app({
        baseDir: 'static-server',
      });
      return app.ready();
    });

    after(() => app.close());

    it('should get exists js file', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .expect(/console.log\(\'bar\'\);[\r\n]/)
        .expect(200);
    });

    it('should get /public 404', () => {
      return app.httpRequest()
        .get('/public')
        .expect(404);
    });

    it('should 404', () => {
      return app.httpRequest()
        .get('/public/foo404.js')
        .expect(404);
    });

    it('should return 206 with partial content', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .set('range', 'bytes=0-10')
        .expect('Content-Length', '11')
        .expect('Accept-Ranges', 'bytes')
        .expect('Content-Range',
          process.platform === 'win32' ? 'bytes 0-10/21' : 'bytes 0-10/20')
        .expect('console.log')
        .expect(206);
    });

    it('should range don\'t effect non static router', () => {
      return app.httpRequest()
        .get('/foo/bar')
        .set('range', 'bytes=0-5')
        .expect('hello world')
        .expect(200);
    });
  });

  describe('serve dist', () => {
    let app: MockApplication;
    const jsFile: string = getFixtures('static-server-dist/dist/static/app/a.js');
    before(async () => {
      await fs.writeFile(jsFile, 'console.log(\'a\')');
      app = mock.app({
        baseDir: 'static-server-dist',
      });
      await app.ready();
    });

    after(() => app.close());
    after(() => fs.unlink(jsFile));

    it('should get js', () => {
      return app.httpRequest()
        .get('/static/app/assets/foo-a1eb2031.js')
        .expect(/define\("static\/app\/assets\/foo-a1eb2031"/)
        .expect(200);
    });

    it('should cache file', async () => {
      await app.httpRequest()
        .get('/static/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
      await fs.writeFile(jsFile, 'console.log(\'b\')');
      await app.httpRequest()
        .get('/static/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
    });
  });

  describe('serve custom using config.js', () => {
    let app: MockApplication;
    before(() => {
      app = mock.app({
        baseDir: 'static-server-custom',
      });
      return app.ready();
    });

    after(() => app.close());

    it('should get js', () => {
      return app.httpRequest()
        .get('/static-custom/app/assets/foo-a1eb2031.js')
        .expect(/define\("static\/app\/assets\/foo-a1eb2031"/)
        .expect(200);
    });
  });

  describe('serve multiple folder with options.dir', () => {
    let app: MockApplication;
    const jsFile = getFixtures('static-server-with-dir/dist/static/app/a.js');
    before(async () => {
      await fs.writeFile(jsFile, 'console.log(\'a\')');
      app = mock.app({
        baseDir: 'static-server-with-dir',
      });
      await app.ready();
    });

    after(() => app.close());
    after(() => fs.unlink(jsFile));

    it('should get js correct from public folder', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .expect(/console.log\(\'bar\'\);[\r\n]/)
        .expect(200);
    });

    it('should get js correct with range support', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .set('range', 'bytes=0-10')
        .expect('Content-Length', '11')
        .expect('Accept-Ranges', 'bytes')
        .expect('Content-Range',
          process.platform === 'win32' ? 'bytes 0-10/21' : 'bytes 0-10/20',
        )
        .expect('console.log')
        .expect(206);
    });

    it('should get js correct from dist folder', () => {
      return app.httpRequest()
        .get('/public/app/assets/foo-a1eb2031.js')
        .expect(/define\("static\/app\/assets\/foo-a1eb2031"/)
        .expect(200);
    });

    it('should cache file', async () => {
      await app.httpRequest()
        .get('/public/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
      await fs.writeFile(jsFile, 'console.log(\'b\')');
      await app.httpRequest()
        .get('/public/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
    });
  });

  describe('serve multiple folder with options.dirs', () => {
    let app: MockApplication;
    const jsFile = getFixtures('static-server-with-dirs/dist/static/app/a.js');
    before(async () => {
      await fs.writeFile(jsFile, 'console.log(\'a\')');
      app = mock.app({
        baseDir: 'static-server-with-dirs',
      });
      await app.ready();
    });

    after(() => app.close());
    after(() => fs.unlink(jsFile));

    it('should get js correct from public folder', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .expect(/console.log\(\'bar\'\);[\r\n]/)
        .expect(200);
    });

    it('should get js correct with range support', () => {
      return app.httpRequest()
        .get('/public/foo.js')
        .set('range', 'bytes=0-10')
        .expect('Content-Length', '11')
        .expect('Accept-Ranges', 'bytes')
        .expect('Content-Range',
          process.platform === 'win32' ? 'bytes 0-10/21' : 'bytes 0-10/20',
        )
        .expect('console.log')
        .expect(206);
    });

    it('should get js correct from dist folder', () => {
      return app.httpRequest()
        .get('/static/app/assets/foo-a1eb2031.js')
        .expect(/define\("static\/app\/assets\/foo-a1eb2031"/)
        .expect(200);
    });

    it('should cache file', async () => {
      await app.httpRequest()
        .get('/static/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
      await fs.writeFile(jsFile, 'console.log(\'b\')');
      await app.httpRequest()
        .get('/static/app/a.js')
        .expect('console.log(\'a\')')
        .expect(200);
    });
  });
});
