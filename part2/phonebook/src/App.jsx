import { useState, useEffect } from "react";
import personService from "./services/persons";

const Filter = (props) => (
  <div>
    filter shown with <input value={props.value} onChange={props.onChange} />
  </div>
);

const PersonForm = (props) => (
  <form onSubmit={props.onSubmit}>
    <div>
      name: <input value={props.nameValue} onChange={props.onNameChange} />
    </div>
    <div>
      number:{" "}
      <input value={props.numberValue} onChange={props.onNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
);

const Persons = ({ persons, onDelete }) => (
  <div>
    {persons.map((person) => (
      <Person
        key={person.id}
        name={person.name}
        number={person.number}
        onDelete={() => onDelete(person.id)}
      />
    ))}
  </div>
);

const Person = (props) => (
  <div>
    {props.name} {props.number} <button onClick={props.onDelete}>delete</button>
  </div>
);

const Notification = ({ message, type }) => {
  if (message == null) return null;

  return <div className={type}>{message}</div>;
};

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState("success");

  useEffect(() => {
    personService.getAll().then((initialPersons) => {
      setPersons(initialPersons);
    });
  }, []);

  const addPerson = (event) => {
    event.preventDefault();
    const existingPerson = persons.find((p) => p.name === newName);
    if (existingPerson) {
      if (
        window.confirm(
          `${existingPerson.name} is already added to phonebook, replace the old number with a new one?`
        )
      ) {
        const changedPerson = { ...existingPerson, number: newNumber };

        personService
          .update(existingPerson.id, changedPerson)
          .then((returnedPerson) => {
            setPersons(
              persons.map((p) =>
                p.id !== existingPerson.id ? p : returnedPerson
              )
            );
            setNewName("");
            setNewNumber("");
            setMessageType("success");
            setMessage(`Updated ${returnedPerson.name}'s number`);
            setTimeout(() => setMessage(null), 3000);
          })
          .catch((error) => {
            // Handle 404 error
            setMessageType("error");
            setMessage(
              `Information of ${existingPerson.name} has already been removed from server`
            );
            setTimeout(() => setMessage(null), 3000);

            // Also remove the person from UI
            setPersons(persons.filter((p) => p.id !== existingPerson.id));
          });
      }
    } else {
      const personObject = {
        name: newName,
        number: newNumber,
      };

      personService
        .create(personObject)
        .then((returnedPerson) => {
          setPersons(persons.concat(returnedPerson));
          setNewName("");
          setNewNumber("");

          setMessageType("success");
          setMessage(`Added ${returnedPerson.name}`);
          setTimeout(() => setMessage(null), 3000);
        })
        .catch((error) => {
          setMessageType("error");
          setMessage("Failed to add person");
          setTimeout(() => setMessage(null), 3000);
        });
    }
  };

  const deletePerson = (id) => {
    const person = persons.find((p) => p.id === id);
    if (!person) return;

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter((p) => p.id !== id));
        })
        .catch((error) => {
          setMessageType("error");
          setMessage(
            `Information of ${person.name} has already been removed from server`
          );
          setTimeout(() => setMessage(null), 3000);

          setPersons(persons.filter((p) => p.id !== id));
        });
    }
  };

  const handleNameChange = (event) => {
    console.log(event.target.value);
    setNewName(event.target.value);
  };

  const handleNumberChange = (event) => {
    console.log(event.target.value);
    setNewNumber(event.target.value);
  };

  const handleFilterChange = (event) => {
    console.log(event.target.value);
    setFilter(event.target.value);
  };

  const personsToShow = filter
    ? persons.filter((person) =>
        person.name.toLowerCase().includes(filter.toLowerCase())
      )
    : persons;

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
      <Filter value={filter} onChange={handleFilterChange} />
      <h2>Add a new</h2>
      <PersonForm
        onSubmit={addPerson}
        nameValue={newName}
        onNameChange={handleNameChange}
        numberValue={newNumber}
        onNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons persons={personsToShow} onDelete={deletePerson} />
    </div>
  );
};

export default App;
