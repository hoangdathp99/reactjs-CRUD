// import './App.css';
import {Container, Row, Col, Card, Button, Form, ListGroup, CloseButton} from "react-bootstrap";
import {useEffect, useState} from "react";
import React from 'react';
import {
    ApolloClient,
    InMemoryCache,
    gql, useMutation
} from "@apollo/client";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
    const [input, setInput] = useState('');
    const toastId_create = React.useRef(null);
    const toastId_delete = React.useRef(null);
    const toastId_update = React.useRef(null);
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

    const [create_todo, {loading: createLoading, error: createError }] = useMutation(CREATE_TODO);
    const [update_todo, {loading: updateLoading, error: updateError}] = useMutation(UPDATE_TODO);
    const [delete_todo, {loading: deleteLoading, error: deleteError}] = useMutation(DELETE_TODO);
    const [delete_done,{}] = useMutation(CLEAR_DONE_TODO);
    useEffect(() => {
        getData();
    }, []);
    useEffect(()=>{
        if(createLoading){
            toastId_create.current = toast.loading('creating task...', );

        }
        else if(!createError){

            toast.update(toastId_create.current,{
                render: "created task",
                type: "success",
                isLoading: false,
                closeOnClick: true,
                autoClose: 1000
            });
            toastId_create.current = null

        }
        else if(createError){
            toast.update(toastId_create.current,{
                render: "cannot create task!!!",
                type: "error",
                isLoading: false,
                closeOnClick: true,
                // autoClose: 1000
            });
            toastId_create.current = null
        }
    },[createLoading])
    useEffect(()=>{
        if(deleteLoading){
            // setShowErrorDelete(true);
            toastId_delete.current=toast.loading('Deleting task...', );
        }
        else if(!deleteError){
            toast.update(toastId_delete.current,{
                render: "deleted task",
                type: "success",
                isLoading: false,
                closeOnClick: true,
                autoClose: 1000
            });
            toastId_delete.current = null
        }
        else if(deleteError){
            toast.update(toastId_delete.current,{
                render: "cannot delete task",
                type: "error",
                isLoading: false,
                closeOnClick: true,
                // autoClose: 1000
            });
            toastId_delete.current = null
        }
    },[deleteLoading])
    useEffect(() => {
        if(updateLoading){
            toastId_update.current = toast.loading('updating task...', );
        }
        else if(!updateError){
            toast.update(toastId_update.current,{
                render: "updated task",
                type: "success",
                isLoading: false,
                closeOnClick: true,
                autoClose: 1000
            });
            toastId_update.current = null
            // setTimer()
        }
        else if(updateError){
            toast.update(toastId_update.current,{
                render: "cannot update task",
                type: "error",
                isLoading: false,
                closeOnClick: true,
                // autoClose: 1000
            });
            toastId_update.current = null
        }
    }, [updateLoading])
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
                      className={'p-3'}
                  >
                      <Form.Group className="mb-2">
                          <Form.Control
                              type="text"
                              placeholder="Enter description"
                              disabled={createLoading}
                              required
                              value={input}
                              onChange={e => {setInput(e.target.value)}}
                          />
                      </Form.Group>
                      <Button variant="primary" onClick={ async () => {
                          await create_todo({ variables: { description: input } }).then(async (result) => {
                              getData()
                          })
                          setInput('')

                      }} >
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
                                      // active={todo.isFinished}
                                  >
                                      <Form.Check
                                          type={'checkbox'}
                                          id={`default-checkbox`}
                                          checked={todo.isFinished}
                                          onClick={() => {
                                              update_todo({variables: {id: todo.id, isFinished: !todo.isFinished}}).then(() => getData());
                                          }}
                                          onChange={()=>{}}
                                      />
                                      <div className="ms-2 me-auto">
                                          <div className="fw-bold">{todo.description}</div>
                                      </div>
                                      <CloseButton disabled={deleteLoading} onClick={() => {delete_todo({ variables: { id: todo.id } }).then(() => getData())}}/>
                                  </ListGroup.Item>
                              );
                          })
                      }
                  </ListGroup>
                  <div className={'text-center'}>
                      <Button variant="success" type="submit" className={'mt-3 mb-3'} onClick={()=>{delete_done().then(()=>getData())}}>
                          Clear done Todo
                      </Button>
                  </div>
              </Card>
          </Col>
        </Row>
          <ToastContainer

          />
      </Container>
  );
}

export default App;
