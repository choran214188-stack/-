/** 인용문 비교용 정규화: 공백/따옴표/문장부호 차이를 제거한다. */
export function normalizeQuote(input: string): string {
  return input
    .replace(/[\u201C\u201D\u2018\u2019"'`]/g, "")
    .replace(/[.,!?~…·\-—:;()[\]{}]/g, "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

/** 인용문이 원문에 실제로 존재하는지 확인한다. */
export function quoteExistsIn(source: string, quote: string): boolean {
  const s = normalizeQuote(source);
  const q = normalizeQuote(quote);
  if (q.length < 4) return false;
  return s.includes(q);
}
