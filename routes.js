import { Router } from "./deps.js";
import { showBeanies, showGloves, showMasks, showLanding } from "./controller.js";

const router = new Router();

router.get('/', showLanding);

router.get('/gloves', showGloves)
      .get('/facemasks', showMasks)
      .get('/beanies', showBeanies);


export { router };