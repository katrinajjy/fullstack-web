require("dotenv").config();
const express = require("express");
const Person = require("./models/person");

const morgan = require("morgan");
//const path = require("path");

const app = express();

// Define a custom token to log request body (only for POST)
morgan.token("post-data", (request) => {
  return request.method === "POST" ? JSON.stringify(request.body) : "";
});

// Logging middleware with custom token
app.use(
  morgan(
    ":method :url :status :res[content-length] - :response-time ms :post-data"
  )
);

app.use(express.static("dist"));
// Parse JSON bodies
app.use(express.json());

// Get all persons
app.get("/api/persons", (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons);
  });
});

// Info route
app.get("/info", (request, response, next) => {
  Person.countDocuments({})
    .then((count) => {
      const date = new Date();
      response.send(`
    <p>Phonebook has info for ${count} people</p>
    <p>${date}</p>
    `);
    })
    .catch((error) => next(error));
});

// Get a single person by id
app.get("/api/persons/:id", (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person);
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

// Delete a person
app.delete("/api/persons/:id", (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      console.log("Deleting person with ID:", request.params.id);
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// Add a new person
app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  const person = new Person({
    name: body.name,
    number: body.number,
  });

  person
    .save()
    .then((savedPerson) => {
      response.json(savedPerson);
    })
    .catch((error) => next(error));
});

// Update a person's number
app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body;
  const updatedPerson = { name, number };

  Person.findByIdAndUpdate(request.params.id, updatedPerson, {
    new: true,
    runValidators: true,
  })
    .then((person) => {
      if (!person) {
        return response.status(404).end();
      }
      response.json(person);
    })
    .catch((error) => next(error));
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" });
};

// handler of requests with unknown endpoint
app.use(unknownEndpoint);

// Error handler
const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }

  next(error);
};

app.use(errorHandler);

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
