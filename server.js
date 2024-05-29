const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const app = express()

const authors = [ 
    {id: 1, name: "Author 1"},
    {id: 2, name: "Author 2"},
    {id: 3, name: "Author 3"}
]

const books = [
    {id:1, name: "Book 1", authorId: 1},
    {id:2, name: "Book 2", authorId: 1},
    {id:3, name: "Book 3", authorId: 1},
    {id:4, name: "Book 4", authorId: 2},
]

const BookType = new GraphQLObjectType({
    name: "Book",
    description: "This represents a book written by an author",
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: book=>authors.find(author=> author.id===book.authorId)
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: "Author",
    description: "This represents an author",
    fields: ()=> ({
        id: {type: GraphQLNonNull(GraphQLInt)},
        name: {type: GraphQLNonNull(GraphQLString)},
        book:{
            args:{
                id: {type:GraphQLInt}
            },
            type: BookType,
            resolve: (_, args)=> books.find(book=>book.id === args.id)
        },
        books:{
            type: new GraphQLList(BookType),
            resolve: author=> books.filter(book=>book.authorId === author.id)
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name:"Query",
    description:"Root Query",
    fields:()=>({
        books:{
            type: GraphQLList(BookType),
            description: "List of books",
            resolve: ()=> books
        },
        authors:{
            type: GraphQLList(AuthorType),
            description: "List of authors",
            resolve: ()=> authors
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Root Mutation",
    fields: ()=>({
        addBook: {
            type: BookType,
            description: "Add a Book",
            args:{
                name:{type:GraphQLString},
                authorId: {type: GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args)=>{
                const book = {
                    id: books.length + 1,
                    name: args.name,
                    authorId: args.authorId
                }
                books.push(book)
                return book
            }
        }
    })
})
const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema,
    graphiql: true
}))

app.listen(5000, ()=>console.log('Server running'))
