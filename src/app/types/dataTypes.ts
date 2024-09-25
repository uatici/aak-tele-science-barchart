export interface IData {
  [year: string]: {
    [month: string]: {
      [date: string]: number;
    }[];
  }[];
}

export interface IFlattenedData {
    date: string;
    value: number;
}
