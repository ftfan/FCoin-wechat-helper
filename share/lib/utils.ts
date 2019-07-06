export const sleep = (time = 20) => new Promise(resolve => setTimeout(resolve, time));

export function clone<T> (data: T) {
  return JSON.parse(JSON.stringify(data)) as T;
}
