import * as mongodb from "mongodb";

export interface Post {
  _id?: mongodb.ObjectId;
  title: string;
  content: string;
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}