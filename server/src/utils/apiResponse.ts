const apiResponse = (success: boolean, message: string, data?: any) => {
  return {
    success,
    message,
    data,
  };
};

export default apiResponse;
