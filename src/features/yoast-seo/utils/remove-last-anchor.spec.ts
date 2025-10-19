import { describe, expect, it } from "vitest";

import { removeLastAnchor } from "./remove-last-anchor";

describe("removeLastAnchor", () => {
  it("extracts details from the first anchor and removes the trailing one", () => {
    const input =
      "<a href='https://yoa.st/shopify8' target='_blank'>Keyphrase in introduction</a>: Your keyphrase or its synonyms do not appear in the first paragraph. <a href='https://yoa.st/shopify9' target='_blank'>Make sure the topic is clear immediately</a>.";

    expect(removeLastAnchor(input)).toEqual({
      link: "https://yoa.st/shopify8",
      title: "Keyphrase in introduction",
      subtitle:
        "Your keyphrase or its synonyms do not appear in the first paragraph",
      acta: "Make sure the topic is clear immediately",
    });
  });

  it("handles a single anchor without trailing punctuation gracefully", () => {
    const input = `<a href="https://yoa.st/test" target="_blank">Test Title</a>:  This is a description`;

    expect(removeLastAnchor(input)).toEqual({
      link: "https://yoa.st/test",
      title: "Test Title",
      subtitle: "This is a description",
      acta: null,
    });
  });

  it("uses the very last anchor as acta when more than two anchors are present", () => {
    const input =
      "<a href='https://yoa.st/a'>Title</a>: Check A <a href='https://yoa.st/b'>middle anchor</a> and keep reading. <a href='https://yoa.st/c'>Final CTA</a>!";

    expect(removeLastAnchor(input)).toEqual({
      link: "https://yoa.st/a",
      title: "Title",
      subtitle: "Check A middle anchor and keep reading",
      acta: "Final CTA",
    });
  });

  it("returns null if no anchor can be found", () => {
    expect(
      removeLastAnchor("The sentence does not include any anchor tags."),
    ).toBeNull();
  });
});
