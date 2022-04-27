import { GraphQLServer } from 'graphql-yoga';
import { v4 as uuidv4 } from 'uuid';

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

  type Mutation {
    createUser(data: CreateUserInput) : User!
    createPost(data: CreatePostInput): Post!
    createComment(data: CreateCommentInput): Comment!
  }

  input CreateUserInput{
    name: String!,
    email: String!,
    age: Int
  }

  input CreatePostInput{
    title: String!,
    body: String!,
    published: Boolean!,
    author: ID!
  }

  input CreateCommentInput{
    text: String!,
    post: ID!,
    author: ID!
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

  Mutation: {
    createUser(parent, args, ctx, info) {
      const emailTaken = users.some((user) => user.email === args.data.email);
      if (emailTaken) throw new Error('Email taken');

      const user = {
        id: uuidv4(),
        ...args.data,
      };

      users.push(user);

      return user;
    },

    createPost(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id == args.data.author);

      if (!userExists) throw new Error('User not found');

      const post = {
        id: uuidv4(),
        ...args.data,
      };

      posts.push(post);

      return post;
    },

    createComment(parent, args, ctx, info) {
      const userExists = users.some((user) => user.id == args.data.author);
      const postExists = posts.some((post) => post.id == args.data.post);

      if (!userExists) throw new Error(`User doesn't exist`);
      if (!postExists) throw new Error(`Post doesn't exist`);

      const comment = {
        id: uuidv4(),
        ...args.data,
      };

      comments.push(comment);

      return comment;
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
