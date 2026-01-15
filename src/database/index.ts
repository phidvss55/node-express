import mongoose from 'mongoose';

const { MONGODB_PORT, MONGODB_HOST, MONGODB_DATABASE } = process.env;

export const connectionToDatabase = () => {
  // const strConnection = `mongodb+srv://root:root@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?retryWrites=true&w=majority`;
  // const strConnection = `mongodb://root:root@127.0.0.1:27027/mongodb_node_express?authSource=admin`;
  const strConnection = process.env.MONGODB_CONNECTION_STRING || `undefined`;

  mongoose
    .connect(strConnection)
    .then(() => {
      console.log('[MONGODB]:: Connected to database');
    })
    .catch((err) => {
      console.log('[MONGODB]:: Something wrong happened: ' + err);
    });
};
