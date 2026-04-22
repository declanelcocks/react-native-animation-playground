export enum Indicator {
  BollingerBands = 'bollingerBands',
  Kdj = 'kdj',
  MovingAverage = 'movingAverage',
  Rsi = 'rsi',
}

export enum QuoteSession {
  Core = 'Core',
  PostMarket = 'PostMarket',
  PreMarket = 'PreMarket',
}

export type BollingerBandsSettings = {
  length: Scalars['Int'];
  standardDeviations: Scalars['Int'];
};

export type IndicatorLine = {
  __typename?: 'IndicatorLine';
  data?: Maybe<Maybe<TimeSeriesData>[]>;
  name?: Maybe<Scalars['String']>;
};

export type KdjSettings = {
  dSmoothing: Scalars['Int'];
  kSmoothing: Scalars['Int'];
  length: Scalars['Int'];
};

export type Maybe<T> = null | T;

export type MovingAverageLength = {
  enabled: Scalars['Boolean'];
  length: Scalars['Int'];
};

export type MovingAverageSettings = {
  lengths: Maybe<MovingAverageLength>[];
};

export type Quote = {
  __typename?: 'Quote';
  ask?: Maybe<Scalars['Float']>;
  bid?: Maybe<Scalars['Float']>;
  callLevel?: Maybe<Scalars['Float']>;
  change?: Maybe<Scalars['StringOrFloat']>;
  changeRatio?: Maybe<Scalars['StringOrFloat']>;
  close?: Maybe<Scalars['Float']>;
  currency?: Maybe<Scalars['String']>;
  currencySymbol?: Maybe<Scalars['String']>;
  /** ISO Date / Datetime */
  date?: Maybe<Scalars['String']>;
  effGearing?: Maybe<Scalars['Float']>;
  /** ISO Date of the quote in the exchange time zone */
  exchangeDate?: Maybe<Scalars['String']>;
  /** ISO Time of the quote in the exchange time zone */
  exchangeTime?: Maybe<Scalars['String']>;
  extendedQuote?: Maybe<Quote>;
  gearing?: Maybe<Scalars['Float']>;
  high?: Maybe<Scalars['Float']>;
  id?: Maybe<Scalars['String']>;
  isRealTime?: Maybe<Scalars['Boolean']>;
  isSuspended?: Maybe<Scalars['Boolean']>;
  last?: Maybe<Scalars['Float']>;
  low?: Maybe<Scalars['Float']>;
  marketIdentificationCode?: Maybe<Scalars['String']>;
  open?: Maybe<Scalars['Float']>;
  outstandingPct?: Maybe<Scalars['Float']>;
  outstandingQty?: Maybe<Scalars['Float']>;
  previousClose?: Maybe<Scalars['Float']>;
  previousCloseDate?: Maybe<Scalars['String']>;
  quoteSession?: Maybe<QuoteSession>;
  spotPriceVsCallLevel?: Maybe<Scalars['Float']>;
  spotPriceVsCallLevelPct?: Maybe<Scalars['Float']>;
  symbol?: Maybe<Scalars['String']>;
  /** Unix time in milliseconds */
  timestamp?: Maybe<Scalars['Float']>;
  /** Timezone of the exchange */
  timezone?: Maybe<Scalars['String']>;
  token?: Maybe<Scalars['String']>;
  volume?: Maybe<Scalars['Float']>;
};

export type RsiSettings = {
  length: Scalars['Int'];
};

export type Scalars = {
  Boolean: boolean;
  Float: number;
  ID: string;
  Int: number;
  String: string;
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: any;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** The `JSONObject` scalar type represents JSON objects as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSONObject: any;
  /** Accepts a String | Float, and converts the strings into floats */
  StringOrFloat: any;
  /** The `Upload` scalar type represents a file upload. */
  Upload: any;
};

export type TechnicalAnalysis = {
  __typename?: 'TechnicalAnalysis';
  indicator: Indicator;
  lines: Maybe<IndicatorLine>[];
};

export type TechnicalAnalysisInput = {
  bollingerBands?: Maybe<BollingerBandsSettings>;
  kdj?: Maybe<KdjSettings>;
  movingAverage?: Maybe<MovingAverageSettings>;
  rsi?: Maybe<RsiSettings>;
};

export type TimeSeriesData = {
  __typename?: 'TimeSeriesData';
  dateTime: Scalars['String'];
  timestamp: Scalars['Float'];
  value?: Maybe<Scalars['Float']>;
};

export interface TimeSlice {
  __typename?: 'TimeSlice';
  historicalPrices?: Quote[];
  technicalAnalysis?: Maybe<Maybe<TechnicalAnalysis>[]>;
  timeSliceAmount?: Maybe<Scalars['Float']>;
  timeSliceType?: Maybe<Scalars['String']>;
}
