/**
 * WeChat mini program native constructor App.
*/
declare const App: (appConfig: any) => void;

/**
 * WeChat mini program native constructor Page.
*/
declare const Page: (pageConfig: any) => void;

/**
 * WeChat mini program native constructor Component.
*/
declare const Component: (pageConfig: any) => void;

/**
 * WeChat mini program native method.
*/
declare const getCurrentPages: () => any[]

/**
 * WeChat mini program native API
*/
declare const wx: {
  request(options: any): any
}
