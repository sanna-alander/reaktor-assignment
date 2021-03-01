//jee jee!
import { Application } from "./deps.js";
import { router } from "./routes.js";
import { viewEngine, engineFactory, adapterFactory } from "./deps.js";
import { middleware } from "./controller.js";

const app = new Application();

const ejsEngine = engineFactory.getEjsEngine();
const oakAdapter = adapterFactory.getOakAdapter();
app.use(viewEngine(oakAdapter, ejsEngine, {
    viewRoot: "./views"
}));

app.use(middleware);

app.use(router.routes());

let port = 7777;
if (Deno.args.length > 0) {
  const lastArgument = Deno.args[Deno.args.length - 1];
  port = Number(lastArgument);
}

if (!Deno.env.get('TEST_ENVIRONMENT')) {
  app.listen({ port: port });
}

export { app }
