export type DocResult = {
  content: {
    content: string;
    learned_profile: { learning_style: string; preferred_formats: string[] };
    title: string;
    topics: string[];
  };
  documentId: string;
  url: string;
};
