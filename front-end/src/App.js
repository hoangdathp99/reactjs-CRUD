// import './App.css';
import {Container, Row, Col, Card, Button, Form, ListGroup, CloseButton} from "react-bootstrap";
import {useEffect, useState} from "react";
import {
    ApolloClient,
    InMemoryCache,
    gql, useMutation
} from "@apollo/client";

const client = new ApolloClient({
    uri: 'http://localhost:4000/',
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'ignore',
        },
        query: {
            fetchPolicy: 'no-cache',
            errorPolicy: 'all',
        },
    },
});

function App() {
    const [todos, setTodos] = useState([]);

    let input;

    const CREATE_TODO = gql`
        mutation Mutation($description: String) {
            createTodo(description: $description)
        }
    `;

    const UPDATE_TODO = gql`
        mutation UpdateTodo($id: Int, $description: String, $isFinished: Boolean) {
            updateTodo(id: $id, description: $description, isFinished: $isFinished)
        }   
    `;

    const DELETE_TODO = gql`
        mutation UpdateTodo($id: Int) {
            deleteTodo(id: $id)
        }
    `;
    const CLEAR_DONE_TODO = gql`
        mutation Deletedone {
             deleteDoneItems
        }`;

    const [create_todo, { data, loading, error, reset }] = useMutation(CREATE_TODO);
    const [update_todo, {}] = useMutation(UPDATE_TODO);
    const [delete_todo, {}] = useMutation(DELETE_TODO);
    const [delete_done,{}] = useMutation(CLEAR_DONE_TODO);
    useEffect(() => {
        getData();
    }, []);

    const getData = () => {
        client
            .query({
                query: gql`
                  query GetTodos {
                      todos {
                        description
                        id
                        isFinished
                      }
                    }
                `
            })
            .then(result =>
                setTodos(result.data.todos)
            );
    }

  return (
      <Container>
        <Row>
          <Col>
              <Card className={'mt-5'}>
                  <Card.Header>Todo app</Card.Header>
                  <Form
                      style={{
                          textAlign: "center",
                    }}
                      onSubmit={e => {
                          e.preventDefault();
                          create_todo({ variables: { description: input.value } }).then(() => {getData()});
                          input.value = '';
                      }}
                      className={'p-3'}
                  >
                      <Form.Group className="mb-2">
                          <Form.Control
                              type="text"
                              placeholder="Enter description"
                              ref={node => {
                                  input = node;
                              }}
                          />
                      </Form.Group>
                      <Button variant="primary" type="submit">
                          Submit
                      </Button>
                  </Form>
                  <ListGroup as="ol" numbered className={'mt-2'}>
                      {
                          todos && todos.map(todo => {
                              return (
                                  <ListGroup.Item
                                      // as="li"
                                      className="d-flex justify-content-between align-items-start"
                                      key={todo.id}
                                      active={todo.isFinished}
                                  >
                                      <Form.Check
                                          type={'checkbox'}
                                          id={`default-checkbox`}
                                          checked={todo.isFinished}
                                          onClick={() => {
                                              update_todo({variables: {id: todo.id, isFinished: !todo.isFinished}}).then(() => getData());
                                          }}
                                      />
                                      <div className="ms-2 me-auto">
                                          <div className="fw-bold">{todo.description}</div>
                                      </div>
                                      <CloseButton onClick={() => {delete_todo({ variables: { id: todo.id } }).then(() => getData())}}/>
                                  </ListGroup.Item>
                              );
                          })
                      }
                  </ListGroup>
                  <Button variant="success" type="submit" className={'mt-3'} onClick={()=>{delete_done().then(()=>getData())}}>
                      clear done Todo
                  </Button>
              </Card>
          </Col>
        </Row>
      </Container>
  );
}

export default App;
