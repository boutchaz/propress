export type Section = {
  "@id"?: string;
  "@type"?: string;
  id: number;
  name: string;
  position?: number;
  color?: string | null;
  icon?: string;
};

export type Publication = {
  "@id": string;
  "@type": string;
  id: number;
  gescomCode: string;
  slug: string;
  enabled: boolean;
  releaseOffset: number;
  name: string;
  uuid: string;
};

export type Issue = {
  id: number;
  originalFilename: string;
  issueNumber: string;
  releaseDate: string;
  pageCount: number;
  releaseOffset: number;
  publishable: boolean;
  uuid: string;
  publication: Publication;
  releaseTime: string;
  coverUrl: string;
};

export type SectionItem = {
  "@id": string;
  "@type": string;
  id: number;
  ojdTag: string;
  position: number;
  releaseOffset: null | number;
  goalFixedUpon: null | number;
  issue: Issue;
  publication: Publication;
};
