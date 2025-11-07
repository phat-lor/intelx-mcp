export interface SearchRequest {
  term: string;
  buckets?: string[];
  lookuplevel?: number;
  maxresults?: number;
  timeout?: number;
  datefrom?: string;
  dateto?: string;
  sort?: number;
  media?: number;
  terminate?: string[];
}

export interface PhonebookSearchRequest extends SearchRequest {
  target?: "all" | "domains" | "emails" | "urls";
}

export interface SearchResponse {
  id: string;
  status: number;
}

export interface SearchRecordNormalized {
  system_id: string;
  bucket: string;
  name: string;

  indexfile?: string;
  storage_id: string;
  media: number;
  type: number;

  added: string;
  date: string;
}

export interface SearchRecord {
  systemid: string;
  name: string;
  bucket: string;
  bucketh: string;
  added: string;
  date: string;
  size: number;
  media: number;
  mediah: string;
  type: number;
  typeh: string;
  storageid: string;
  xscore: number;
  simhash?: string;
  description?: string;
  keyvalues?: Record<string, unknown>;
  tags?: string[];
  relations?: string[];
  indexfile?: string;
  historyfile?: string;
  [key: string]: unknown;
}

export interface SearchResultResponse {
  status: number;
  records: SearchRecord[];
  [key: string]: unknown;
}

export interface PhonebookSelector {
  selectortype: number;
  selectortypeh: string;
  selectorvalue: string;
  [key: string]: unknown;
}

export interface PhonebookSelectorNormalized {
  type: number;
  value: string;
}

export interface PhonebookResultResponse {
  status: number;
  selectors: PhonebookSelector[];
  [key: string]: unknown;
}

export interface TreeViewItem {
  systemid: string;
  name: string;
  date: string;
  media: number;
  type: number;
  size: number;
  bucket?: string;
  [key: string]: unknown;
}

export interface Selector {
  systemid: string;
  selector: string;
  selectorh: string;
  type: number;
  typeh: string;
}

export interface CapabilitiesResponse {
  [key: string]: unknown;
}

export interface IdentitySearchRequest {
  selector: string;
  bucket?: string;
  skipinvalid?: boolean;
  limit?: number;
  analyze?: boolean;
  datefrom?: string;
  dateto?: string;
  terminate?: string[];
}

export interface IdentityRecord {
  item: {
    name: string;
    date: string;
    bucket: string;
    storageid: string;
    systemid: string;
    [key: string]: unknown;
  };
  linea: string;
  [key: string]: unknown;
}

export interface IdentityNormalizedRecord {
  line: string;
  system_id: string;
  storage_id: string;
  bucket: string;
  filename: string;
  date: string;
}

export interface IdentitySearchResponse {
  id: string;
  status: number;
  records?: IdentityRecord[];
  [key: string]: unknown;
}

export interface AccountNormalizedRecord {
  user: string;
  password: string;
  passwordtype: string;
  source: string;
  system_id: string;

  date: string;
  added: string;
}

export interface AccountRecord {
  user: string;
  password: string;
  passwordtype: string;
  sourceshort: string;
  sourcelong: string;
  systemid: string;

  date: string;
  added: string;
  [key: string]: unknown;
}

export interface AccountExportResponse {
  id: string;
  status: number;
  records?: AccountRecord[];
  [key: string]: unknown;
}

export interface IntelXError {
  code: number;
  message: string;
}
