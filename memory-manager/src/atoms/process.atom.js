import { atom } from "recoil";

/* process structure {
  hash: int,
  name: string,
  size: int, -> (min 1byte; max 1mb)
  pagesRequested: int,
  pageFailCount: int,
  pageSucessCount: int,
  pageCount,
} */
export const createdProcessesState = atom({
  key: 'createdProcessesState',
  default: [],
});