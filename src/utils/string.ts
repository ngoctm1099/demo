export const upperCaseFirstLetterOfEachWord = (value: string) =>
  value?.replace(/(^\w{1})|(\s+\w{1})/g, letter => letter.toUpperCase());

export const lowerCaseFirstLetterOfEachWord = (value: string) => value.replace(/(?:^|\s)\S/g, a => a.toLowerCase());

export const toLocales = (value: string) => value;
