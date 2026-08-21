import { runLiveImport } from '../src/controllers/importLive.controller.ts';

const counts = await runLiveImport();
console.log('Imported live website content', counts);
