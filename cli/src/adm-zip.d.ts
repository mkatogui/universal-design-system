declare module 'adm-zip' {
  class AdmZip {
    constructor(path?: string | Buffer);
    addLocalFolder(localPath: string, zipPath?: string): void;
    writeZip(targetPath: string): void;
  }
  export = AdmZip;
}
