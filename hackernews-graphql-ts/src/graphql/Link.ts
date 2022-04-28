import {
  enumType,
  extendType,
  idArg,
  inputObjectType,
  intArg,
  list,
  arg,
  nonNull,
  objectType,
  stringArg,
} from 'nexus';
import {NexusGenObjects} from '../../nexus-typegen';

export const LinkOrderByInput = inputObjectType({
  name: 'LinkOrderByInput',
  definition(t) {
    t.field('description', {type: Sort});
    t.field('url', {type: Sort});
    t.field('createdAt', {type: Sort});
  },
});

export const Sort = enumType({
  name: 'Sort',
  members: ['asc', 'desc'],
});

export const Link = objectType({
  name: 'Link',
  definition(t) {
    t.nonNull.int('id');
    t.nonNull.string('description');
    t.nonNull.string('url');
    t.nonNull.dateTime('createdAt');
    t.field('postedBy', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({where: {id: parent.id}})
          .postedBy();
      },
    });
    t.nonNull.list.nonNull.field('voters', {
      type: 'User',
      resolve(parent, args, context) {
        return context.prisma.link
          .findUnique({where: {id: parent.id}})
          .voters();
      },
    });
  },
});

let links: NexusGenObjects['Link'][] = [];

export const LinkQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('feed', {
      type: 'Link',
      args: {
        filter: stringArg(),
        skip: intArg(),
        take: intArg(),
        orderBy: arg({type: list(nonNull(LinkOrderByInput))}),
      },
      resolve(parent, args, context) {
        const where = args.filter
          ? {
              OR: [
                {description: {contains: args.filter}},
                {url: {contains: args.filter}},
              ],
            }
          : {};
        return context.prisma.link.findMany({
          where,
          skip: args?.skip as number | undefined,
          take: args?.take as number | undefined,
        });
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
        const {userId} = context;

        if (!userId) throw new Error('Cannot post without logging in');

        const newLink = context.prisma.link.create({
          data: {
            description,
            url,
            postedBy: {connect: {id: userId}},
          },
        });

        return newLink;
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
