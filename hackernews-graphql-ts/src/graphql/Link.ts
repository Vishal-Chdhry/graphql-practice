import {extendType, nonNull, objectType, stringArg} from 'nexus';
import {NexusGenObjects} from '../../nexus-typegen';

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('description');
    t.nonNull.string('url');
  },
});

let links: NexusGenObjects['Link'][] = [
  {
    id: 1,
    url: 'https://howtographql.com',
    description: 'Full Stack tutorial for graphql',
  },
  {
    id: 3,
    url: 'https://graphql.org',
    description: 'GraphQL offical website',
  },
];

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      resolve(parent, args, context, info) {
        return links;
      },
    });
  },
});

export const LinkMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('post', {
      type: 'Link',
      args: {
        description: nonNull(stringArg()),
        url: nonNull(stringArg()),
      },

      resolve(parent, args, context, info) {
        const {description, url} = args;

        let idCount = links.length + 1;
        const link = {
          id: idCount,
          description: description,
          url: url,
        };

        links.push(link);

        return link;
      },
    });
  },
});
