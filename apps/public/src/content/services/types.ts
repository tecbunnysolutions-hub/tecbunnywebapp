export type ServiceDetail = {
  title: string;
  paragraphs: string[];
};

export type ServiceFaq = {
  question: string;
  answer: string;
};

export type ServiceContent = {
  slug: string;
  path: string;
  name: string;
  title: string;
  metaDescription: string;
  promise: string;
  audience: string[];
  problems: string[];
  whatWeDo: ServiceDetail[];
  buyersGuide: ServiceDetail[];
  pricing: ServiceDetail;
  process: ServiceDetail[];
  included: string[];
  notIncluded: string[];
  warranty: string[];
  notRightFor: string[];
  faqs: ServiceFaq[];
  areas: string;
  serviceDescription: string;
  priceIds?: string[];
};
