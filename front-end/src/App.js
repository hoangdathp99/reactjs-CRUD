// import './App.css';
import {Container, Row, Col, Card, Button, Form, ListGroup, CloseButton, Alert} from "react-bootstrap";
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
    const [showErrorcreate, setShowErrorcreate] = useState(false);
    const [showLoadingcreate, setShowLoadingcreate] = useState(false);
    const [showErrorDelete, setShowErrorDelete] = useState(false);
    // useEffect(()=> {
    //     console.log(todos)
    // },[todos])
    const toastId = React.useRef(null);
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

    const [create_todo, { data: datacreate, loading: createLoading, error: createError }] = useMutation(CREATE_TODO);
    const [update_todo, {loading: updateLoading, error: updateError}] = useMutation(UPDATE_TODO);
    const [delete_todo, {loading: deleteLoading, error: deleteError}] = useMutation(DELETE_TODO);
    const [delete_done,{}] = useMutation(CLEAR_DONE_TODO);
    useEffect(() => {
        getData();
    }, []);
    // useEffect(()=>{
    //     // console.log(createError)
    //     if(createError){
    //         setShowErrorcreate(true);
    //         toast.error('Cannot creat task!!!', {
    //             position: "top-right",
    //             autoClose: false,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //         });
    //     }
    //
    // }, [createError])
    useEffect(()=>{
        if(createLoading){
            setShowLoadingcreate(true);
            toastId.current = toast.loading('creating task...', );

        }
        else if(!createError){
            setShowLoadingcreate(false)
            // toast.dismiss(toastId.current)
            toast.update(toastId.current,{
                render: "created task",
                type: "success",
                isLoading: false,
                closeOnClick: true,
                // autoClose: 1000
            })
        }
        else if(createError){
            toast.update(toastId.current,{
                render: "cannot create task!!!",
                type: "error",
                isLoading: false,
                closeOnClick: true,
                // autoClose: 1000
            })
        }
    },[createLoading])
    useEffect(()=>{
        if(deleteError){
            setShowErrorDelete(true);
            toast.error('Cannot delete task!!!', {
                            position: "top-right",
                            autoClose: false,
                            hideProgressBar: false,
                            closeOnClick: true,
                            pauseOnHover: true,
                            draggable: true,
                            progress: undefined,
                        });
        }
        else{
            setShowErrorDelete(false)
        }
    },[deleteLoading])
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
    const addTask = async (temp_id) =>{
        if (input != ""){
            let task = {
                id: temp_id,
                description: input,
                isFinished: false,
            }
            let todos_clone =[...todos];
            todos_clone.push(task)
            setTodos(todos_clone)
            console.log(todos)
        }
        else alert("write des first")
    }
    const deleteTaskFailed = (temp_id) =>{
        let todos_clone = [...todos];
        let index = todos_clone.findIndex(task => task.id == temp_id)
        if(index>-1){
            todos_clone.splice(index,1)
            setTodos(todos_clone)
        }

    }
    const updateTask = (temp_id, id) => {
        let index = todos.findIndex(task => task.id == temp_id)
        if(index>-1){
            let todo_clone = [...todos]
            todo_clone[index].id = id
            setTodos(todo_clone)
        }
    }
    const create = (temp_id) => {
         create_todo({ variables: { description: input } }).then( (result) => {
             updateTask(temp_id, result)
        }).catch( e => {
             console.log(todos)
             deleteTaskFailed(temp_id)
        });
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
                              // ref={node => {
                              //     input = node;
                              // }}
                              value={input}
                              onChange={e => {setInput(e.target.value)}}
                          />
                      </Form.Group>
                      <Button variant="primary" onClick={ async () => {
                          let temp_id = Date.now().toString()
                          // them task vao list offline
                          // await addTask(temp_id);
                          await create_todo({ variables: { description: input } }).then(async (result) => {
                              // await updateTask(temp_id, result)
                              getData()
                          })
                          //     .catch(async e => {
                          //     await deleteTaskFailed(temp_id)
                          // });
                          setInput('')

                      }} >
                          Submit
                      </Button>
                  </Form>
                  {/*{createError && showErrorcreate &&*/}
                  {/*    <Alert variant="danger" onClose={() => setShowErrorcreate(false)} dismissible>*/}
                  {/*        <Alert.Heading>Cannot create task!!</Alert.Heading>*/}
                  {/*        <p>*/}
                  {/*            Please check your Internet or wait a few minutes*/}
                  {/*        </p>*/}
                  {/*    </Alert>}*/}
                  {/*{deleteError && showErrorDelete &&*/}
                  {/*<Alert variant="danger" onClose={() => setShowErrorDelete(false)} dismissible>*/}
                  {/*    <Alert.Heading>Cannot delete task!!</Alert.Heading>*/}
                  {/*    <p>*/}
                  {/*        Please check your Internet or wait a few minutes*/}
                  {/*    </p>*/}
                  {/*</Alert>}*/}
                  {/*{createLoading && showLoadingcreate &&*/}
                  {/*<Alert variant="info" onClose={() => setShowErrorcreate(false)} dismissible>*/}
                  {/*    <Alert.Heading>Creating new Task</Alert.Heading>*/}
                  {/*</Alert>}*/}
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
          <ToastContainer/>
      </Container>
  );
}

export default App;
