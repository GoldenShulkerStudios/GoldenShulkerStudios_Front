export interface Comment {
    id: number;
    content: string;
    created_at: string;
    upvotes: number;
    downvotes: number;
    user_vote: number;
    user: {
        username: string;
        role: string;
    };
}

export interface Post {
    id: number;
    user_id: number;
    content?: string;
    image_url?: string;
    video_url?: string;
    upvotes: number;
    downvotes: number;
    user_vote: number;
    created_at: string;
    comments: Comment[];
    user: {
        username: string;
        role: string;
    };
}
