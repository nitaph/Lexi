export const requestHandler = (fn, onError?) => async (req, res) => {
  try {
    console.info(`Pending request: ${req.method} ${req.originalUrl}`);
    await fn(req, res);
    console.info(`Success request: ${req.method} ${req.originalUrl}`);
  } catch (error) {
    console.error(
      `Error occurred in request: ${req.method} ${req.originalUrl}`,
      error
    );
    if (onError) {
      onError(req, res, error);
    } else {
      const statusCode =
        typeof error?.status === "number"
          ? error.status
          : typeof error?.statusCode === "number"
            ? error.statusCode
            : typeof error?.code === "number"
              ? error.code
              : 500;
      const message = error?.message ?? "Internal Server Error";
      res.status(statusCode).json({ message });
    }
  }
};
