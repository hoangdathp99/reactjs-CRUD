const { ApolloServer, gql } = require("apollo-server")
const  db  = require("./mysql")
// const express = require('express')
// const Cors = require('cors')
// const typeDefs = `
//   type Todo {
//     id: Int
//     description: String!
//     isFinished: Boolean!
//   }
//
//   type Query {
//     todos: [Todo]
//     todo (id: ID!): Todo
//   }
//   type Mutation {
//     createTodo(description: String): String
//     updateTodo(id: Int, description: String, isFinished:Boolean!): String
//     deleteTodo(id: Int): String
//     deleteDoneItems: [Todo]
//     resetItems:[Todo]
//   }
// `;
const typeDefs = `
  type Todo {
    id: Int,
    description: String
    isFinished: Boolean
  }

  type Query {
    todos: [Todo]
    todo(id: ID!): Todo
  }
  
  type Mutation {
    updateTodo(
      id: Int, 
      description: String
      isFinished: Boolean
    ): String
    createTodo(
      description: String
    ): String
    deleteTodo(id: Int): String
  }
`;

const resolvers = {
    Query: {
        todos: async () => db.Todo.findAll(),
        todo: async (obj, args, context, info) =>
            db.Todo.findByPk(args.id),
    },
    Mutation: {
        createTodo: async (root, args, context, info) => {
            let todo = await db.Todo.create({
                description: args.description,
                // isFinished: args.isFinished,
            });
            return todo.id;
        },
        updateTodo: async (root, args, context, info) => {
            if (!args.id) return;
            let todo = await db.Todo.update({
                description: args.description,
                isFinished: args.isFinished,
            }, {
                where: {id: args.id}
            });
            return 'Update Success!';
        },
        deleteTodo: async (root, args, context, info) => {
            if (!args.id) return;
            let todo = await db.Todo.destroy({
                where: {
                    id: args.id
                }
            })
            return 'Delete success!';
        }
    }
};

const server = new ApolloServer({
  typeDefs: gql(typeDefs),
  resolvers,
  context: {db}
})

// const app = express()
// app.use(Cors())
server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
