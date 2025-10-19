export interface ExtractedYoastLink {
  link: string;
  title: string;
  subtitle: string;
  acta: string | null;
}

const anchorRegex =
  /<a\b[^>]*href=(["'])(?<href>[^"']+)\1[^>]*>(?<text>[\s\S]*?)<\/a>/gi;

const stripHtml = (value: string): string =>
  value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

const stripLeadingPunctuation = (value: string): string =>
  value.replace(/^\s*[:\-–—]+\s*/, "");

const stripTrailingPunctuation = (value: string): string =>
  value.replace(/[\s.!?;,:]+$/g, "").trim();

const removeLastAnchorFrom = (
  value: string,
  anchors: RegExpMatchArray[],
): string => {
  if (anchors.length < 2) {
    return value;
  }

  const first = anchors[0];
  const last = anchors[anchors.length - 1];

  if (
    first === undefined ||
    last === undefined ||
    first.index === undefined ||
    last.index === undefined ||
    first[0] === undefined ||
    last[0] === undefined
  ) {
    return value;
  }

  const firstEnd = first.index + first[0].length;
  const offset = last.index - firstEnd;

  if (offset < 0) {
    return value;
  }

  return value.slice(0, offset) + value.slice(offset + last[0].length);
};

export const removeLastAnchor = (input: string): ExtractedYoastLink | null => {
  if (!input) {
    return null;
  }

  const anchors = [...input.matchAll(anchorRegex)];

  if (anchors.length === 0) {
    return null;
  }

  const firstAnchor = anchors[0];
  if (!firstAnchor) {
    return null;
  }
  const link = firstAnchor.groups?.href ?? "";
  const title = stripHtml(firstAnchor.groups?.text ?? "");
  const hasLastAnchor = anchors.length > 1;
  const lastAnchor = hasLastAnchor ? anchors[anchors.length - 1] : undefined;
  const acta = hasLastAnchor ? stripHtml(lastAnchor?.groups?.text ?? "") : null;

  const matchedAnchor = firstAnchor[0];
  const firstAnchorEnd = matchedAnchor
    ? (firstAnchor.index ?? 0) + matchedAnchor.length
    : (firstAnchor.index ?? 0);
  const remainder = input.slice(firstAnchorEnd);

  const remainderWithoutLastAnchor = hasLastAnchor
    ? removeLastAnchorFrom(remainder, anchors)
    : remainder;
  const subtitle = stripTrailingPunctuation(
    stripLeadingPunctuation(stripHtml(remainderWithoutLastAnchor)),
  );

  return {
    link,
    title,
    subtitle,
    acta,
  };
};
