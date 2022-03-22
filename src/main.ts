import express from 'express';

const main = async (): Promise<void> => {
  const app = express();
  app.listen({ port: 4000 });
};

main();
