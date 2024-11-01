import * as express from "express";
import { ObjectId } from "mongodb";
import { collections } from "./database";

export const postRouter = express.Router();
postRouter.use(express.json());

postRouter.get("/", async (req, res) => {
    try {
        const searchTerm = req.query.term as string;

        // when a search term is provided, create a filter with regex
        const filter = searchTerm
            ? {
                $or: [
                    { title: { $regex: searchTerm, $options: "i" } },
                    { content: { $regex: searchTerm, $options: "i" } },
                    { category: { $regex: searchTerm, $options: "i" } }
                ]
            }
            : {};

        const posts = await collections?.posts?.find(filter).toArray();
        res.status(200).send(posts);
    } catch (error) {
        res.status(500).send(error instanceof Error ? error.message : "An unexpected error occurred.");
    }
});

postRouter.get("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const post = await collections?.posts?.findOne(query);

        if (post) {
            res.status(200).send(post);
        } else {
            res.status(404).send(`Post not found 
: ID ${id}`);
        }
    } catch (error) {
        res.status(404).send(`Post not found 
: ID ${req?.params?.id}`);
    }
});

postRouter.post("/", async (req, res) => {
    try {
        const post = {
            ...req.body,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await collections?.posts?.insertOne(post);

        if (result?.acknowledged) {
            res.status(201).send(`Created a new post with ID ${result.insertedId}.`);
        } else {
            res.status(500).send("Failed to create a new post.");
        }
    } catch (error) {
        console.error(error);
        res.status(400).send(error instanceof Error ? error.message : "Unknown error");
    }
});

postRouter.put("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const updateData = req.body;
        const query = { _id: new ObjectId(id) };

        const post = {
            ...updateData,
            updatedAt: new Date(),
        };

        const result = await collections?.posts?.updateOne(query, { $set: post });

        if (result && result.matchedCount) {
            res.status(200).send(`Updated an post with ID ${id}.`);
        } else if (!result?.matchedCount) {
            res.status(404).send(`Failed to find an post with ID ${id}`);
        } else {
            res.status(304).send(`Failed to update an post with ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});

postRouter.delete("/:id", async (req, res) => {
    try {
        const id = req?.params?.id;
        const query = { _id: new ObjectId(id) };
        const result = await collections?.posts?.deleteOne(query);

        if (result && result.deletedCount) {
            res.status(204).send(`Removed an post with ID ${id}`);
        } else if (!result) {
            res.status(400).send(`Failed to remove an post with ID ${id}`);
        } else if (!result.deletedCount) {
            res.status(404).send(`Failed to find an post with ID ${id}`);
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        console.error(message);
        res.status(400).send(message);
    }
});