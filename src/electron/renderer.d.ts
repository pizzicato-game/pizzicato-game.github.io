export interface IElectronAPI {
  initVariables: () => Promise<void>;
  getAppPath: () => string;
  isDebugMode: () => bool;
  // storeData: (
  //   path: string,
  //   data: string | Buffer | ArrayBufferView | DataView,
  // ) => void;
  // loadData: (path: string) => string;
  // listSubDirectories: (parentDir: string) => string[];
  // fileExists: (absoluteFilePath: string) => boolean;
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}
