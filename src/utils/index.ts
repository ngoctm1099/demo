import { saveAs } from "file-saver";

const isEqual = (o1, o2) => JSON.stringify(o1) === JSON.stringify(o2);

const isValidImageKey = image => typeof image === "string" && image?.includes("images/");

const sortArrayByObjectKey = (array, key) => array?.sort((a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0));

const sortArrayString = array => array?.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));

const Uint8ArrayToBlob = uintArray => URL.createObjectURL(new Blob([(uintArray as Buffer).buffer]));

const exportCSVToFile = (data, fileName) => saveAs(Uint8ArrayToBlob(data), fileName);

const objectToParams = object => new URLSearchParams(object as Record<string, string>).toString();

const debounce = (callback, delay = 1000) => {
  let timeoutID = setTimeout(() => callback(), delay);

  return () => {
    if (timeoutID) clearTimeout(timeoutID);
  };
};

const getLocaleCode = () => {
  var localeCode = "";
  if (window.navigator.languages) {
    localeCode = window.navigator.languages[0];
  } else {
    localeCode = window.navigator.language;
  }

  return localeCode.split("-")[1];
};

export {
  isEqual,
  isValidImageKey,
  sortArrayByObjectKey,
  sortArrayString,
  Uint8ArrayToBlob,
  exportCSVToFile,
  objectToParams,
  debounce,
  getLocaleCode,
};
