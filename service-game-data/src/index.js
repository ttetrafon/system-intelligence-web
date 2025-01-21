export const handler = async (event) => {
  console.log('Event:', event);
  return {
      statusCode: 200,
      body: { message: 'Hello from Dockerized Lambda!' }
  };
};