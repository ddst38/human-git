import Vue from 'vue';
import Vuex, { StoreOptions } from 'vuex';
import VuexPersistence from 'vuex-persist';

import { RootState } from './types';

// Use the notification module from Vue Dot
import { notification } from '@cnamts/vue-dot/src/modules/notification';
import { user } from '@/store/modules/user';

/** The store is saved in the browser's session */
const vuexLocal = new VuexPersistence<RootState>();

Vue.use(Vuex);

/** @see https://vuex.vuejs.org/fr/getting-started.html for help */
const storeOptions: StoreOptions<RootState> = {
	strict: true,
	state: {},
	/** @see https://vuex.vuejs.org/guide/modules.html for more informations on modules */
	modules: {
		notification,
		user
	},
	plugins: [
		vuexLocal.plugin
	]
};

export const store = new Vuex.Store<RootState>(storeOptions);
