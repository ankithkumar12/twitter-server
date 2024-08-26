import { initServer } from "./app";
import 'dotenv/config'


require('dotenv').config()
console.log(process.env) 

async function init() {
  const app = await initServer();
  app.listen(8000, () => console.log(`Server Started at PORT:8000`));
}

init();
