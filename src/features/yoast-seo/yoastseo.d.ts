declare module "yoastseo" {
  export namespace interpreters {
    // https://github.com/Yoast/wordpress-seo/blob/d0c1ca602093f2f605627880d1fc3f70f78b0246/packages/yoastseo/src/scoring/interpreters/scoreToRating.js
    function scoreToRating(
      score: number,
    ): "error" | "feedback" | "bad" | "ok" | "good" | "";
  }

  /**
   * Represents a range or position within source code or text.
   */
  export interface SourceCodeRange {
    startOffset: number;
    endOffset: number;
    startOffsetBlock?: number;
    endOffsetBlock?: number;
    clientId?: string;
    attributeId?: string;
    isFirstSection?: boolean;
  }

  /**
   * Properties for constructing a Mark instance.
   */
  export interface MarkProperties {
    original?: string;
    marked?: string;
    fieldsToMark?: string[];
    position?: SourceCodeRange;
  }

  /**
   * Serialized representation of a Mark instance.
   */
  export interface MarkSerialized extends MarkProperties {
    _parseClass: "Mark";
  }

  export class Mark {
    constructor(properties?: MarkProperties);

    /** Returns the original text. */
    getOriginal(): string;

    /** Returns the marked (highlighted/replaced) text. */
    getMarked(): string;

    /** Returns the fields to mark. */
    getFieldsToMark(): string[];

    /** Returns the position information object. */
    getPosition(): SourceCodeRange | undefined;

    /** Returns the start position offset. */
    getPositionStart(): number | undefined;

    /** Returns the end position offset. */
    getPositionEnd(): number | undefined;

    /** Sets the start position offset. */
    setPositionStart(positionStart: number): void;

    /** Sets the end position offset. */
    setPositionEnd(positionEnd: number): void;

    /** Sets the block start offset. */
    setBlockPositionStart(startOffsetBlock: number): void;

    /** Sets the block end offset. */
    setBlockPositionEnd(endOffsetBlock: number): void;

    /** Gets the block client ID. */
    getBlockClientId(): string | undefined;

    /** Gets the block attribute ID. */
    getBlockAttributeId(): string | undefined;

    /** Checks if the mark is for the first section of a Yoast sub-block. */
    isMarkForFirstBlockSection(): boolean | undefined;

    /** Gets the block start position. */
    getBlockPositionStart(): number | undefined;

    /** Gets the block end position. */
    getBlockPositionEnd(): number | undefined;

    /** Applies this mark to text using replacement-based highlighting. */
    applyWithReplace(text: string): string;

    /** Applies this mark to text using position-based highlighting. */
    applyWithPosition(text: string): string;

    /** Serializes the Mark instance to an object. */
    serialize(): MarkSerialized;

    /** Validates this mark instance for consistency. Throws RangeError or Error if invalid. */
    isValid(): void;

    /** Returns true if the mark has position-based highlighting info. */
    hasPosition(): boolean;

    /** Returns true if the mark has block position info. */
    hasBlockPosition(): boolean;

    /** Parses a serialized object into a Mark instance. */
    static parse(serialized: MarkSerialized): Mark;
  }

  export class Assessment {
    /**
     * Executes the assessment and return its result.
     *
     * @param paper       The paper to run this assessment on.
     * @param researcher  The researcher used for the assessment.
     *
     * @returns The result of the assessment.
     */
    getResult(paper: Paper, researcher: Researcher): AssessmentResult;

    /**
     * Checks whether the assessment is applicable.
     *
     * @param paper       The paper to run this assessment on.
     * @param researcher  The researcher used for the assessment.
     *
     * @returns Whether the assessment is applicable, defaults to `true`.
     */
    isApplicable(paper: Paper, researcher: Researcher): boolean;

    /**
     * Tests whether a `Paper` has enough content for assessments to be displayed.
     *
     * @param paper The paper to run this assessment on.
     * @param contentNeededForAssessment The minimum length in characters a text must have for assessments to be displayed. Defaults to 50.
     *
     * @returns `true` if the text is of the required length, `false` otherwise.
     */
    hasEnoughContentForAssessment(
      paper: Paper,
      contentNeededForAssessment?: number,
    ): boolean;

    /**
     * Formats a string with the URL to the article about a specific assessment.
     *
     * @param resultText The string to format.
     * @param urlTitle The URL to the article about a specific assessment.
     * @param urlCallToAction The URL to the help article for a specific assessment.
     * @returns The formatted string.
     */
    formatResultText(
      resultText: string,
      urlTitle: string,
      urlCallToAction: string,
    ): string;
  }

  export interface AssessmentResultValues {
    score?: number;
    text?: string;
    marks?: Mark[];
    _hasBetaBadge?: boolean;
    _hasJumps?: boolean;
    editFieldName?: string;
    editFieldAriaLabel?: string;
    _hasAIFixes?: boolean;
  }

  export interface AssessmentResultSerialized {
    _parseClass: "AssessmentResult";
    identifier: string;
    score: number;
    text: string;
    marks: any[]; // results of Mark#serialize()
    _hasBetaBadge: boolean;
    _hasJumps: boolean;
    _hasAIFixes: boolean;
    editFieldName: string;
    editFieldAriaLabel: string;
  }

  export class AssessmentResult {
    constructor(values?: AssessmentResultValues);

    _identifier: string;

    // Public fields set by the implementation
    score: number;
    text: string;
    marks: Mark[];
    editFieldName: string;
    editFieldAriaLabel: string;

    // Score
    hasScore(): boolean;
    getScore(): number;
    setScore(score: number): void;

    // Text
    hasText(): boolean;
    getText(): string;
    setText(text?: string): void;

    // Marks
    getMarks(): Mark[];
    setMarks(marks: Mark[]): void;

    // Identifier
    setIdentifier(identifier: string): void;
    getIdentifier(): string;

    // Marker (pure function returning marks for a given Paper)
    setMarker(marker: (...args: any[]) => any): void;
    hasMarker(): boolean;
    getMarker(): (...args: any[]) => any;

    // Booleans about marks/badges/jumps/ai fixes
    setHasMarks(hasMarks: boolean): void;
    hasMarks(): boolean;

    setHasBetaBadge(hasBetaBadge: boolean): void;
    hasBetaBadge(): boolean;

    setHasJumps(hasJumps: boolean): void;
    hasJumps(): boolean;

    setHasAIFixes(hasAIFixes: boolean): void;
    hasAIFixes(): boolean;

    // Edit field metadata
    hasEditFieldName(): boolean;
    getEditFieldName(): string;
    setEditFieldName(editFieldName: string): void;

    hasEditFieldAriaLabel(): boolean;
    getEditFieldAriaLabel(): string;
    setEditFieldAriaLabel(editFieldAriaLabel: string): void;

    // (De)serialization
    serialize(): AssessmentResultSerialized;
    static parse(serialized: AssessmentResultSerialized): AssessmentResult;
  }

  export declare const assessments = {
    seo: Record<string, typeof Assessment>,
    readability: Record<string, typeof Assessment>,
  };

  export class Node {
    /** This node's name or tag. */
    name: string;

    /** This node's attributes. */
    attributes: Record<string, any>;

    /** This node's child nodes. */
    childNodes: Array<Node | Text>;

    /** The location of this node inside the HTML (if available). */
    sourceCodeLocation?: SourceCodeLocation;

    /**
     * Creates a new node.
     *
     * @param name The node's name or tag.
     * @param attributes This node's attributes.
     * @param childNodes This node's child nodes.
     * @param sourceCodeLocationInfo This node's location in the source code, from parse5.
     */
    constructor(
      name: string,
      attributes?: Record<string, any>,
      childNodes?: Array<Node | Text>,
      sourceCodeLocationInfo?: Record<string, any>,
    );

    /**
     * Finds all nodes in the tree that satisfy the given condition.
     *
     * @param condition The condition that a node should satisfy to end up in the list.
     * @param recurseFoundNodes Whether to recurse into found nodes to see if the condition also applies to sub-nodes of the found node.
     * @returns The list of nodes that satisfy the condition.
     */
    findAll(
      condition: (node: Node | Text) => boolean,
      recurseFoundNodes?: boolean,
    ): Array<Node | Text>;

    /**
     * Retrieves the parent node for the current node.
     *
     * @param tree The full tree for this node.
     * @returns The parent node.
     */
    getParentNode(tree: Node): Node | null;

    /**
     * Returns the inner text (text without any markup) from this node.
     *
     * @returns The inner text from this node.
     */
    innerText(): string;

    /**
     * Retrieves the start offset for this node.
     *
     * @returns The start offset.
     */
    getStartOffset(): number;
  }

  export type WritingDirection = "LTR" | "RTL";

  /** Attributes accepted by the Paper constructor. All are optional at construction time. */
  export interface PaperAttributes {
    keyword?: string;
    synonyms?: string;
    description?: string;
    title?: string;
    titleWidth?: number;
    slug?: string;
    locale?: string;
    permalink?: string;
    date?: string;
    wpBlocks?: object[];
    customData?: Record<string, any>;
    textTitle?: string | null;
    writingDirection?: WritingDirection;
    isFrontPage?: boolean;
    /** @deprecated since 1.19.1 — use `slug` instead. */
    url?: string;
  }

  /** Attributes after defaults are applied (what `serialize()` returns). */
  export interface PaperResolvedAttributes {
    keyword: string;
    synonyms: string;
    description: string;
    title: string;
    titleWidth: number;
    slug: string;
    locale: string;
    permalink: string;
    date: string;
    wpBlocks: object[];
    customData: Record<string, any>;
    textTitle: string;
    writingDirection: WritingDirection;
    isFrontPage: boolean;
  }

  /** Shape returned by `serialize()` and accepted by `Paper.parse()` */
  export type SerializedPaper = {
    _parseClass: "Paper";
    text: string;
  } & PaperResolvedAttributes;

  /**
   * Represents an object where the analysis data is stored.
   */
  export class Paper {
    constructor(text: string, attributes?: PaperAttributes);

    /** Keyword */
    hasKeyword(): boolean;
    getKeyword(): string;

    /** Synonyms */
    hasSynonyms(): boolean;
    getSynonyms(): string;

    /** Text */
    hasText(): boolean;
    getText(): string;

    /** Parse tree */
    setTree(tree: Node): void;
    getTree(): Node | null;

    /** Description (meta description) */
    hasDescription(): boolean;
    getDescription(): string;

    /** SEO title */
    hasTitle(): boolean;
    getTitle(): string;

    /** SEO title width (px) */
    hasTitleWidth(): boolean;
    getTitleWidth(): number;

    /** Slug */
    hasSlug(): boolean;
    getSlug(): string;

    /** Front page flag */
    isFrontPage(): boolean;

    /** @deprecated since 1.19.1 — use `hasSlug()` */
    hasUrl(): boolean;

    /** @deprecated since 1.19.1 — use `getSlug()` */
    getUrl(): string;

    /** Locale */
    hasLocale(): boolean;
    getLocale(): string;

    /** Writing direction */
    getWritingDirection(): WritingDirection;

    /** Permalink */
    hasPermalink(): boolean;
    getPermalink(): string;

    /** Date */
    hasDate(): boolean;
    getDate(): string;

    /** Custom data */
    hasCustomData(): boolean;
    getCustomData(): Record<string, any>;

    /** Text title */
    hasTextTitle(): boolean;
    getTextTitle(): string;

    /** Serialize to a plain object (including defaults). */
    serialize(): SerializedPaper;

    /** Deep equality with another Paper's text + attributes. */
    equals(paper: Paper): boolean;

    /** Parse a SerializedPaper (or return the instance if already a Paper). */
    static parse(serialized: SerializedPaper | Paper): Paper;
  }

  export class Assessor {
    constructor(researcher: Researcher, options?: AssessorOptions);

    /** Type of this object. */
    type: string;

    /** Internal assessments list. */
    protected _assessments: Assessment[];

    /** Results of the latest assessment run. */
    results: AssessmentResult[];

    /** Internal options. */
    protected _options: AssessorOptions;

    /** Internal ScoreAggregator. */
    protected _scoreAggregator: ScoreAggregator | null;

    /** The researcher used by this assessor. */
    protected _researcher: Researcher;

    /** The last assessed paper. */
    protected _lastPaper?: Paper;

    /** Whether this assessor currently has markers. */
    protected _hasMarkers?: boolean;

    /**
     * Checks if the researcher is defined and sets it.
     *
     * @throws MissingArgument If researcher is undefined.
     */
    setResearcher(researcher: Researcher): void;

    /** Returns all available assessments. */
    getAvailableAssessments(): Assessment[];

    /** Checks whether an assessment is applicable. */
    isApplicable(
      assessment: Assessment,
      paper: Paper,
      researcher?: Researcher,
    ): boolean;

    /** Determines whether an assessment has a marker. */
    hasMarker(assessment: Assessment): boolean;

    /** Returns the specific marker for this assessor. */
    getSpecificMarker(): AssessorOptions["marker"];

    /** Returns the paper that was most recently assessed. */
    getPaper(): Paper | undefined;

    /** Returns the marker for a given assessment. */
    getMarker(
      assessment: Assessment,
      paper: Paper,
      researcher: Researcher,
    ): () => void;

    /** Runs all registered assessments on the given paper. */
    assess(paper: Paper): void;

    /** Sets the value of `hasMarkers`. */
    setHasMarkers(hasMarkers: boolean): void;

    /** Returns whether this assessor currently has markers. */
    hasMarkers(): boolean;

    /** Executes an assessment and returns its AssessmentResult. */
    executeAssessment(
      paper: Paper,
      researcher: Researcher,
      assessment: Assessment,
    ): AssessmentResult;

    /** Returns all valid AssessmentResults (with score + text). */
    getValidResults(): AssessmentResult[];

    /** Determines whether an AssessmentResult is valid. */
    isValidResult(assessmentResult: AssessmentResult): boolean;

    /** Calculates and returns the overall score (0–100). */
    calculateOverallScore(): number;

    /** Registers a new assessment. */
    addAssessment(name: string, assessment: Assessment): boolean;

    /** Removes an assessment by name. */
    removeAssessment(name: string): void;

    /** Returns an assessment by its identifier. */
    getAssessment(identifier: string): Assessment | undefined;

    /** Returns only applicable assessments. */
    getApplicableAssessments(): Assessment[];

    /** Returns the ScoreAggregator for this assessor. */
    getScoreAggregator(): ScoreAggregator | null;
  }

  export declare class ContentAssessor extends Assessor {}
  export declare class InclusiveLanguageAssessor extends Assessor {}
  export declare class RelatedKeywordAssessor extends Assessor {}
  export declare class RelatedKeywordTaxonomyAssessor extends Assessor {}
  export declare class SEOAssessor extends Assessor {}
  export declare class TaxonomyAssessor extends Assessor {}

  export declare class CornerstoneContentAssessor extends Assessor {}
  export declare class CornerstoneRelatedKeywordAssessor extends Assessor {}
  export declare class CornerstoneSEOAssessor extends Assessor {}

  export declare class CollectionCornerstoneRelatedKeywordAssessor extends Assessor {}
  export declare class CollectionCornerstoneSEOAssessor extends Assessor {}
  export declare class CollectionRelatedKeywordAssessor extends Assessor {}
  export declare class CollectionSEOAssessor extends Assessor {}

  export declare class ProductCornerstoneContentAssessor extends Assessor {}
  export declare class ProductCornerstoneRelatedKeywordAssessor extends Assessor {}
  export declare class ProductCornerstoneSEOAssessor extends Assessor {}
  export declare class ProductContentAssessor extends Assessor {}
  export declare class ProductRelatedKeywordAssessor extends Assessor {}
  export declare class ProductSEOAssessor extends Assessor {}

  export declare class StoreBlogCornerstoneSEOAssessor extends Assessor {}
  export declare class StoreBlogSEOAssessor extends Assessor {}

  export declare class StorePostsAndPagesCornerstoneContentAssessor extends Assessor {}
  export declare class StorePostsAndPagesCornerstoneRelatedKeywordAssessor extends Assessor {}
  export declare class StorePostsAndPagesCornerstoneSEOAssessor extends Assessor {}
  export declare class StorePostsAndPagesContentAssessor extends Assessor {}
  export declare class StorePostsAndPagesRelatedKeywordAssessor extends Assessor {}
  export declare class StorePostsAndPagesSEOAssessor extends Assessor {}

  export declare class MetaDescriptionAssessor extends Assessor {}
  export declare class SeoTitleAssessor extends Assessor {}
  export declare class KeyphraseUseAssessor extends Assessor {}
  export declare class KeyphraseAssessor extends Assessor {}

  /**
   * All assessors exported by the accessors module.
   */
  export declare const assessors: {
    Assessor: typeof Assessor;
    ContentAssessor: typeof ContentAssessor;
    InclusiveLanguageAssessor: typeof InclusiveLanguageAssessor;
    RelatedKeywordAssessor: typeof RelatedKeywordAssessor;
    RelatedKeywordTaxonomyAssessor: typeof RelatedKeywordTaxonomyAssessor;
    SEOAssessor: typeof SEOAssessor;
    TaxonomyAssessor: typeof TaxonomyAssessor;
    CornerstoneContentAssessor: typeof CornerstoneContentAssessor;
    CornerstoneRelatedKeywordAssessor: typeof CornerstoneRelatedKeywordAssessor;
    CornerstoneSEOAssessor: typeof CornerstoneSEOAssessor;
    CollectionCornerstoneRelatedKeywordAssessor: typeof CollectionCornerstoneRelatedKeywordAssessor;
    CollectionCornerstoneSEOAssessor: typeof CollectionCornerstoneSEOAssessor;
    CollectionRelatedKeywordAssessor: typeof CollectionRelatedKeywordAssessor;
    CollectionSEOAssessor: typeof CollectionSEOAssessor;
    ProductCornerstoneContentAssessor: typeof ProductCornerstoneContentAssessor;
    ProductCornerstoneRelatedKeywordAssessor: typeof ProductCornerstoneRelatedKeywordAssessor;
    ProductCornerstoneSEOAssessor: typeof ProductCornerstoneSEOAssessor;
    ProductContentAssessor: typeof ProductContentAssessor;
    ProductRelatedKeywordAssessor: typeof ProductRelatedKeywordAssessor;
    ProductSEOAssessor: typeof ProductSEOAssessor;
    StoreBlogCornerstoneSEOAssessor: typeof StoreBlogCornerstoneSEOAssessor;
    StoreBlogSEOAssessor: typeof StoreBlogSEOAssessor;
    StorePostsAndPagesCornerstoneContentAssessor: typeof StorePostsAndPagesCornerstoneContentAssessor;
    StorePostsAndPagesCornerstoneRelatedKeywordAssessor: typeof StorePostsAndPagesCornerstoneRelatedKeywordAssessor;
    StorePostsAndPagesCornerstoneSEOAssessor: typeof StorePostsAndPagesCornerstoneSEOAssessor;
    StorePostsAndPagesContentAssessor: typeof StorePostsAndPagesContentAssessor;
    StorePostsAndPagesRelatedKeywordAssessor: typeof StorePostsAndPagesRelatedKeywordAssessor;
    StorePostsAndPagesSEOAssessor: typeof StorePostsAndPagesSEOAssessor;
    MetaDescriptionAssessor: typeof MetaDescriptionAssessor;
    SeoTitleAssessor: typeof SeoTitleAssessor;
    KeyphraseUseAssessor: typeof KeyphraseUseAssessor;
    KeyphraseAssessor: typeof KeyphraseAssessor;
  };

  export type ResearchHelper = (...args: unknown[]) => unknown;

  export type ResearchFunction = (
    paper: Paper,
    researcher: AbstractResearcher,
  ) => unknown;

  export interface AbstractResearcherHelpers
    extends Record<string, ResearchHelper> {
    memoizedTokenizer: (text: string, trimSentences?: boolean) => string[];
  }

  export interface AbstractResearcherConfig extends Record<string, unknown> {
    areHyphensWordBoundaries: boolean;
    centerClasses: string[];
  }

  export type AbstractResearcherData = Record<string, unknown>;

  /**
   * The researcher contains all the researches, helpers, data, and config.
   */
  export class AbstractResearcher {
    constructor(paper: Paper);

    paper: Paper;
    defaultResearches: Record<string, ResearchFunction>;
    customResearches: Record<string, ResearchFunction>;
    helpers: AbstractResearcherHelpers;
    config: AbstractResearcherConfig;
    protected _data: AbstractResearcherData;

    setPaper(paper: Paper): void;
    addResearch(name: string, research: ResearchFunction): void;
    addResearchData<T = unknown>(research: string, data: T): void;
    addHelper(name: string, helper: ResearchHelper): void;
    addConfig<T = unknown>(name: string, config: T): void;

    hasResearch(name: string): boolean;
    hasHelper(name: string): boolean;
    hasConfig(name: string): boolean;
    hasResearchData(name: string): boolean;

    getAvailableResearches(): Record<string, ResearchFunction>;
    getAvailableHelpers(): AbstractResearcherHelpers;
    getAvailableConfig(): AbstractResearcherConfig;
    getAvailableResearchData(): AbstractResearcherData;

    getResearch(name: string): unknown | false;
    getData<T = unknown>(research: string): T | false;
    getConfig<T = unknown>(name: string): T | false;
    getHelper(name: string): ResearchHelper | false;
  }

  export class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}

declare module "yoastseo/build/languageProcessing/languages/_default/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/ar/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/ca/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/cs/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/de/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/el/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/en/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/es/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/fa/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/fr/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/he/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/hu/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/id/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/it/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/ja/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/nb/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/nl/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/pl/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/pt/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/ru/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/sk/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/sv/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
declare module "yoastseo/build/languageProcessing/languages/tr/Researcher" {
  import { AbstractResearcher } from "yoastseo";
  export default class Researcher extends AbstractResearcher {
    constructor(paper: Paper);
  }
}
