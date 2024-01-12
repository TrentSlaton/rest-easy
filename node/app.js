import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const app = express();
const PORT = 8080;

app.use(express.json());

app.get("/healthcheck", (req, res) => {
    res.status(200).send("Server is running.");
});

// CREATE User
app.post("/users", async (req, res) => {
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required." });
    }

    const newUser = await prisma.user.create({
        data: { name, email }
    });

    res.status(201).json(newUser);
});

// READ all Users
app.get("/users", async (req, res) => {
    const users = await prisma.user.findMany();
    res.status(200).json(users);
});

// READ by User ID
app.get("/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const getUser = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (getUser) {
            res.status(200).json(getUser);
        } else {
            res.status(404).json({
                error: "User not found."
            });
        }
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({
            error: "Internal server error."
        });
    }
});

// UPDATE by User ID
app.put("/users/:id", async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;

    if (!name || !email) {
        return res.status(400).json({
            error: "Name and email are required."
        });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: { name, email }
        });

        res.status(200).json(updatedUser);
    } catch (e) {
        res.status(500).json({ error: "User not found." });
    }
});

// DELETE all
app.delete("/users/", async (req, res) => {
    try {
        await prisma.user.deleteMany();

        res.status(204).end();
    } catch (error) {
        console.error("Error deleting all users:", error);
        res.status(500).json({ error: "Internal server error." });
    }
});

// DELETE by User ID
app.delete("/users/:id", async (req, res) => {
    const { id } = req.params;

    try {
        const userToDelete = await prisma.user.findUnique({
            where: { id: parseInt(id) }
        });

        if (!userToDelete) {
            return res.status(404).json({
                error: "User not found."
            });
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        });

        res.status(200).end();
    } catch (e) {
        res.status(500).json({
            error: "Internal server error."
        });
    }
});

app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
});
