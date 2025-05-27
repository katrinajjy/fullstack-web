const express = require("express");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

// Parse JSON bodies
app.use(express.json());

// Define a custom token to log request body (only for POST)
morgan.token("post-data", (request) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

// Logging middleware with "tiny" format
//app.use(morgan("tiny"));

// Logging middleware with custom token
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data"
  )
);

app.use(cors());

let persons = [
  {
    id: "1",
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: "2",
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: "3",
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: "4",
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

app.get("/", (request, response) => {
  response.send("<h1>Hello World!</h1>");
});

// Get all persons
app.get("/api/persons", (request, response) => {
  response.json(persons);
});

// Info route
app.get("/info", (request, response) => {
  const numPeople = persons.length;
  const date = new Date();

  response.send(`
    <p>Phonebook has info for ${numPeople} people</p>
    <p>${date}</p>
  `);
});

// Get a single person by id
app.get("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).send({ error: "Person not found" });
  }
});

// Delete a person
app.delete("/api/persons/:id", (request, resposne) => {
  const id = request.params.id;
  const person = persons.find((p) => p.id === id);

  if (!persons) {
    return response.status(404).send({ error: "Person not found" });
  }

  persons = persons.filter((p) => p.id !== id);
  response.status(204).end();
});

// Add a new person
app.post("/api/persons", (request, response) => {
  const body = request.body;

  //Basic validation
  if (!body.name || !body.number) {
    return response.status(400).json({ error: "Name or number missing" });
  }

  // Check for duplicate name
  const nameExists = persons.find((p) => p.name === body.name);
  if (nameExists) {
    return response.status(400).json({ error: "Name must be unique" });
  }

  const newPerson = {
    id: Math.floor(Math.random() * 1000000).toString(), // Random ID as string
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(newPerson);
  response.status(201).json(newPerson);
});

// Start the server
const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
