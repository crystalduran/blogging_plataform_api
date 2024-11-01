import * as mongodb from "mongodb";
import { Post } from "./post";

export const collections: {
    posts?: mongodb.Collection<Post>;
} = {};


async function applySchemaValidation(db: mongodb.Db) {
    // this function sets up a JSON schema that defines the mandatory fields and their types for the documents in the posts collection
    const jsonSchema = {
        $jsonSchema: {
            bsonType: "object",
            required: ["title", "content", "category", "tags", "createdAt", "updatedAt"],
            additionalProperties: false,
            properties: {
                _id: {},
                title: {
                    bsonType: "string",
                    description: "'title' is required and is a string",
                },
                content: {
                    bsonType: "string",
                    description: "'content' is required and is a string",
                    minLength: 5
                },
                category: {
                    bsonType: "string",
                    description: "'category' is required and is a string",
                },
                tags: {
                    bsonType: "array",
                    description: "'tags' is required and is an array of strings",
                    minItems: 1,
                    items: {
                        bsonType: "string",
                    },
                },
                createdAt: {
                    bsonType: "date",
                    description: "'createdAt' is required and is a date",
                },
                updatedAt: {
                    bsonType: "date",
                    description: "'updatedAt' is required and is a date",
                },
            },
        },
    };

    // if the posts collection already exists, the validator is applied with the `collMod` command.
    await db.command({
        collMod: "posts",
        validator: jsonSchema
    }).catch(async (error: mongodb.MongoServerError) => {
        // when the collection does not exist, a new collection “posts” is created with the defined scheme 
        if (error.codeName === "NamespaceNotFound") {
            await db.createCollection("posts", { validator: jsonSchema });
        }
    });
}

export async function connectToDatabase(uri: string) {
    //  create mongodb client instance using the provided uri
    const client = new mongodb.MongoClient(uri);

    try {
        await client.connect();

        const db = client.db("blog_mean");
        await applySchemaValidation(db);

        const postsCollection = db.collection<Post>("posts");
        collections.posts = postsCollection;
        //this sets collections.posts as a reference to the database collection named “posts”, which makes it easy to access collections.posts in any other module that imports collections
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
}