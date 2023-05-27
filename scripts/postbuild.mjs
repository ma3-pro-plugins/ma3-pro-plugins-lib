import fse from 'fs-extra';
(() => {
  try {
    fse.copySync('lib/parseXml.d.ts', 'dist/parseXml.d.ts');
    fse.copySync('lib/base64Codec.d.ts', 'dist/base64Codec.d.ts');

    process.exit(0);
  } catch (error) {
    log.error(error);
    process.exit(1);
  }
})();
