export type DocResult = {
  documentId: string;
  url: string;
  content: {
    title: string;
    content: string;
    topics: string[];
    learned_profile: { learning_style: string; preferred_formats: string[] };
  };
};
