import server from "./server";
import { logger } from "./utils/logging";

/** Better the paths */

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  logger.success(`REST API funcionando en el puerto ${PORT}`);
});
