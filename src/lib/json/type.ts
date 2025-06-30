export type JSONReplacer = (this: any, key: string, value: any) => any;
export type JSONReviver = (this: any, key: string, value: any) => any;

export type Constructor = new (...args: any[]) => any;
