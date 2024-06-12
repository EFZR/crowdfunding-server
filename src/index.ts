import server from "./server";
import { success } from "./utils/logging";

const PORT = process.env.PORT || 4000;

server.listen(PORT, () => {
  success(`REST API funcionando en el puerto ${PORT}`);
});
