import {extendType, idArg, intArg, nonNull, objectType, stringArg} from 'nexus';
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

export const LinkQueryByID = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.field('getOneLink', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
      },

      resolve(parent, args, context, info) {
        const link = links.find(link => link.id === args.id);

        if (typeof link === 'undefined') throw new Error('Link not found');
        return link;
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

export const UpdateLink = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('updateLink', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
        url: stringArg(),
        description: stringArg(),
      },

      resolve(parent, args, context, info) {
        const {id, url, description} = args;

        const link_index = links.findIndex(link => link.id === id);

        if (typeof link_index === 'undefined')
          throw new Error('Link not found');

        links[link_index].url = url ? url : links[link_index].url;
        links[link_index].description = description
          ? description
          : links[link_index].description;

        return links[link_index];
      },
    });
  },
});

export const deleteLink = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('deleteLink', {
      type: 'Link',
      args: {
        id: nonNull(intArg()),
      },

      resolve(parent, args, context, info) {
        const {id} = args;
        const link_index = links.findIndex(link => link.id === id);

        if (typeof link_index === 'undefined')
          throw new Error('Link not found');

        links = links.filter(link => link.id != link_index);
        return links[link_index];
      },
    });
  },
});
