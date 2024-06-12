import server from "./server";
import { success } from "./utils/logging";

/** Better the paths */

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  success(`REST API funcionando en el puerto ${PORT}`);
});
