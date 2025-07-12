export interface Lecture {
    id: number;
    chapter: number;
    title: string;
    filename: string;
    url: string;
    listened: boolean;
    bookmarked: boolean;
    notes: string;
    summary: string;
}
