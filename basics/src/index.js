import { GraphQLServer } from 'graphql-yoga';

const users = [
  { id: '1', name: 'Vishal', email: 'vishal@gmail.com' },
  { id: '2', name: 'Andrew', email: 'andrew@gmail.com' },
  { id: '3', name: 'Someone', email: 'thatsomeone@gmail.com' },
];

const posts = [
  {
    id: '11',
    title: 'The Last Breath',
    body: 'Based on the great fight of runeterra',
    published: true,
    author: '1',
  },
  { id: '12', title: 'Arakis', published: true, author: '3' },
  { id: '13', title: 'The Baptism of Fire', published: false, author: '3' },
];

const comments = [
  {
    id: '201',
    text: 'amazing!!!!',
    post: '11',
    author: '1',
  },
  {
    id: '202',
    text: 'lol',
    post: '12',
    author: '3',
  },
  { id: '203', text: 'keep it up bro', post: '12', author: '2' },
];

const typeDefs = `
  type Query {
    me: User!
    post: Post!
    users(query: String): [User]!
    posts(query: String): [Post]!
    comments: [Comment]!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    age: Int
    posts: [Post]
  }

  type Post {
    id: ID!
    title: String!
    body: String
    published: Boolean!
    author: User!
    comments: [Comment]!
  }

  type Comment {
    id: ID!
    text: String!
    post: Post!
    author: User!
  }
`;

const resolvers = {
  Query: {
    me() {
      return {
        id: '2141413',
        name: 'Vishal',
        email: 'vishal@gmail.com',
      };
    },
    post() {
      return {
        id: 'ds12j3h21jh3v1',
        title: 'My first post',
        published: true,
      };
    },
    comments() {
      return comments;
    },
    posts(parent, args, ctx, info) {
      if (!args.query) return posts;

      return posts.filter((post) => {
        return post.title.toLowerCase().includes(args.query.toLowerCase());
      });
    },
    users(parent, args, ctx, info) {
      if (!args.query) return users;

      return users.filter((user) => {
        return user.name.toLowerCase().includes(args.query.toLowerCase());
      });
    },
  },
  Post: {
    author(parent, args, ctx, info) {
      return users.find((user) => {
        return user.id === parent.author;
      });
    },
    comments(parent, args, ctx, info) {
      return comments.filter((comment) => comment.post === parent.id);
    },
  },
  User: {
    posts(parent, args, ctx, info) {
      return posts.filter((post) => {
        return parent.id === post.author;
      });
    },
  },
  Comment: {
    post(parent, args, ctx, info) {
      return posts.find((post) => {
        return parent.post === post.id;
      });
    },
    author(parent, args, ctx, info) {
      return users.find((user) => user.id === parent.author);
    },
  },
};

const server = new GraphQLServer({
  typeDefs,
  resolvers,
});

server.start(() => console.log('The server is up at http://localhost:4000/'));
