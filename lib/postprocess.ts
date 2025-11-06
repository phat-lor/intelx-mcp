import type {
  AccountNormalizedRecord,
  AccountRecord,
  IdentityNormalizedRecord,
  IdentityRecord,
  PhonebookResultResponse,
  PhonebookSelectorNormalized,
  SearchRecordNormalized,
  SearchResultResponse,
  Selector,
} from "./types";

const TRANSITION_FIELDS = [
  "system_id",
  "storage_id",
  "owner",
  "indexfile",
  "group",
  "randomid",
  "target",
] as const;
type TransitionField = (typeof TRANSITION_FIELDS)[number];

/* ------------------------------------------------------------------ */
/* 1. Dynamically create maps & counters from TRANSITION_FIELDS      */
/* ------------------------------------------------------------------ */
const uuidToIdMaps = new Map<TransitionField, Map<string, number>>();
const idToUuidMaps = new Map<TransitionField, Map<number, string>>();
const counters: Record<TransitionField, number> = {} as any;

for (const field of TRANSITION_FIELDS) {
  uuidToIdMaps.set(field, new Map<string, number>());
  idToUuidMaps.set(field, new Map<number, string>());
  counters[field] = 1;
}

/* ------------------------------------------------------------------ */
/* 2. Forward: normalizeIntelxId (UUID → int)                         */
/* ------------------------------------------------------------------ */
function normalizeIntelxId<T>(results: T): T {
  function deepScan(obj: any): any {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepScan);

    const copy: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        TRANSITION_FIELDS.includes(key as TransitionField) &&
        typeof value === "string"
      ) {
        const field = key as TransitionField;
        const map = uuidToIdMaps.get(field)!;

        if (!map.has(value)) {
          const newId = counters[field]++;
          map.set(value, newId);
          idToUuidMaps.get(field)!.set(newId, value);
        }
        copy[key] = map.get(value);
      } else {
        copy[key] = deepScan(value);
      }
    }
    return copy;
  }

  return deepScan(results) as T;
}

/* ------------------------------------------------------------------ */
/* 3. Reverse: denormalizeIntelxId (int → UUID)                       */
/* ------------------------------------------------------------------ */
function denormalizeIntelxId<T>(normalized: T): T {
  function deepScan(obj: any): any {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepScan);

    const copy: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (
        TRANSITION_FIELDS.includes(key as TransitionField) &&
        typeof value === "number"
      ) {
        const field = key as TransitionField;
        const original = idToUuidMaps.get(field)?.get(value);
        copy[key] = original ?? value; // fallback to number if not mapped
      } else {
        copy[key] = deepScan(value);
      }
    }
    return copy;
  }

  return deepScan(normalized) as T;
}

function getOriginalUuid(
  field: TransitionField,
  id: number,
): string | undefined {
  return idToUuidMaps.get(field)?.get(id);
}

function getNormalizedId(
  field: TransitionField,
  uuid: string,
): number | undefined {
  return uuidToIdMaps.get(field)?.get(uuid);
}

function normalizeIdentityRecords(
  allRecords: IdentityRecord[],
): IdentityNormalizedRecord[] {
  let mergedByStorageId: Record<string, IdentityNormalizedRecord> = {};
  let normalizedRecords = allRecords.map((record) => ({
    line: record.linea,
    system_id: record.item.systemid,
    storage_id: record.item.storageid,
    bucket: record.item.bucket,
    filename: record.item.name,
    date: record.item.date,
  }));
  normalizedRecords.forEach((record) => {
    if (!mergedByStorageId[record.storage_id])
      mergedByStorageId[record.storage_id] = { ...record, line: "" };

    mergedByStorageId[record.storage_id]!.line += "\n" + record.line;
  });

  normalizedRecords = Object.values(mergedByStorageId);

  normalizedRecords = normalizedRecords.map((record) => {
    let line = record.line.trim();

    if (line.length > 128) {
      line = line.slice(0, 128) + `...(More ${line.length - 128} characters)`;
    }
    return {
      ...record,
      line,
    };
  });

  return normalizeIntelxId(normalizedRecords);
}

function normalizePhoneBookResponse(
  allRecords: PhonebookResultResponse[],
): string[] {
  return allRecords.flatMap((response) =>
    response.selectors.map((record) => record.selectorvalue),
  );
}

function normalizeSelectors(allRecords: Selector[]): string[] {
  return allRecords.map((record) => record.selector);
}
function normalizeAccountRecords(
  allRecords: AccountRecord[],
): AccountNormalizedRecord[] {
  return allRecords.map((record) => ({
    user: record.user,
    password: record.password,
    passwordtype: record.passwordtype,
    source: record.sourcelong,
    system_id: record.systemid,

    date: record.date,
    added: record.added,
  }));
}

function normalizeSearchRecordResponse(
  response: SearchResultResponse,
): SearchRecordNormalized[] {
  return response.records.map((record) => ({
    system_id: record.systemid,
    bucket: record.bucket,
    name: record.name,

    indexfile: record.indexfile,
    storage_id: record.storageid,
    media: record.media,
    type: record.type,

    added: record.added,
    date: record.date,
  }));
}

export {
  normalizeSearchRecordResponse,
  normalizePhoneBookResponse,
  normalizeIdentityRecords,
  normalizeAccountRecords,
  normalizeSelectors,
  normalizeIntelxId,
  denormalizeIntelxId,
  getOriginalUuid,
  getNormalizedId,
};
