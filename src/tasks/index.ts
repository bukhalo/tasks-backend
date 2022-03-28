import { schemaComposer } from '../schema-composer';
import { ObjectId } from '../common/graphql/scalars/object-id';
import { UserId } from '../users';
import { DateTime } from '../common/graphql/scalars/date-time';

const TaskId = ObjectId.clone('TaskId');

const Task = schemaComposer.createObjectTC({
  name: 'Task',
  fields: {
    id: {
      description: 'Task ID',
      type: TaskId.NonNull,
      resolve: s => s._id,
    },
    title: {
      description: 'Task title',
      type: 'String!',
    },
    isCompleted: {
      description: 'Is task completed?',
      type: 'Boolean!',
    },
    createdAt: {
      description: 'Task created at',
      type: DateTime.NonNull,
    },
    updatedAt: {
      description: 'Task updated at',
      type: DateTime.NonNull,
    },
    ownerId: {
      description: 'Task owner ID',
      type: UserId.NonNull,
    },
  },
});

const TaskAddPayload = schemaComposer.createObjectTC({
  name: 'TaskAddPayload',
  fields: {
    record: Task,
    recordId: TaskId,
    query: 'Query',
  },
});

const TaskEditPayload = schemaComposer.createObjectTC({
  name: 'TaskEditPayload',
  fields: {
    record: Task,
    recordId: TaskId,
    query: 'Query',
  },
});

const TaskDeletePayload = schemaComposer.createObjectTC({
  name: 'TaskDeletePayload',
  fields: {
    record: Task,
    recordId: TaskId,
    query: 'Query',
  },
});

const TaskAddInput = schemaComposer.createInputTC({
  name: 'TaskAddInput',
  fields: {
    title: {
      description: 'Task title',
      type: 'String!',
    },
    isCompleted: {
      description: 'Is task completed?',
      type: 'Boolean',
      defaultValue: false,
    },
  },
});

const TaskEditInput = schemaComposer.createInputTC({
  name: 'TaskEditInput',
  fields: {
    id: {
      description: 'Task ID',
      type: TaskId.NonNull,
    },
    title: {
      description: 'Task title',
      type: 'String',
    },
    isCompleted: {
      description: 'Is task completed?',
      type: 'Boolean',
    },
  },
});

const TaskDeleteInput = schemaComposer.createInputTC({
  name: 'TaskDeleteInput',
  fields: {
    id: {
      description: 'Task ID',
      type: TaskId.NonNull,
    },
  },
});

schemaComposer.Query.addFields({
  task: {
    type: Task,
    args: {
      id: {
        description: 'Task ID',
        type: TaskId.NonNull,
      },
    },
    resolve: async (s, { id }, { user, tasksCollection }) => {
      if (!user) return null;
      return tasksCollection.findOne({ _id: id });
    },
  },
  taskCollection: {
    type: Task.List,
    resolve: (s, a, { user, tasksCollection }) => {
      if (!user) return null;
      return tasksCollection.find({ ownerId: user.id }).toArray();
    },
  },
});

schemaComposer.Mutation.addNestedFields({
  'task.add': {
    type: TaskAddPayload,
    args: {
      input: {
        type: TaskAddInput,
      },
    },
    resolve: async (s, { input }, { user, tasksCollection }) => {
      if (!user) return null;
      const taskInsertRequest = await tasksCollection.insertOne({
        ...input,
        ownerId: user.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const taskAdded = await tasksCollection.findOne({ _id: taskInsertRequest.insertedId });

      return {
        record: taskAdded,
        recordId: taskAdded!.id,
        query: {},
      };
    },
  },
  'task.edit': {
    type: TaskEditPayload,
    args: {
      input: {
        type: TaskEditInput.NonNull,
      },
    },
    resolve: async (s, { input }, { user, tasksCollection }) => {
      if (!user) return null;
      const { id, ...document } = input;
      await tasksCollection.updateOne({ _id: id, ownerId: user.id }, { $set: document });
      const task = await tasksCollection.findOne({ _id: id });

      return {
        record: task,
        recordId: task!.id,
        query: {},
      };
    },
  },
  'task.delete': {
    type: TaskDeletePayload,
    args: {
      input: {
        type: TaskDeleteInput.NonNull,
      },
    },
    resolve: async (s, { input }, { user, tasksCollection }) => {
      if (!user) return null;
      const task = await tasksCollection.findOne({ _id: input.id });

      await tasksCollection.deleteOne({ _id: input.id, ownerId: user.id });

      return {
        record: task,
        recordId: task!.id,
        query: {},
      };
    },
  },
});
