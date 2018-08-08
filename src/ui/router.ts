/*
 * This file is part of the Fxp Satis Serverless package.
 *
 * (c) François Pluchino <francois.pluchino@gmail.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {Error404} from '@app/ui/components/Error404';
import {RootState} from '@app/ui/stores/RootState';
import Vue from 'vue';
import Router from 'vue-router';
import {Route} from 'vue-router/types/router';
import {Store} from 'vuex';

Vue.use(Router);

/**
 * Create the router.
 *
 * @return {Router}
 *
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export function createRouter(): Router {
    return new Router({
        mode: 'history',
        base: '/admin/',
        routes: [
            {   path: '/',
                component: () => import('@app/ui/components/ChildRouteWrapper').then(({ ChildRouteWrapper }) => ChildRouteWrapper),
                children: [
                    {   path: '',
                        name: 'home',
                        meta: {requiresAuth: true},
                        component: () => import('@app/ui/pages/Home').then(({ Home }) => Home),
                    },
                    {   path: 'login',
                        name: 'login',
                        component: () => import('@app/ui/pages/Login').then(({ Login }) => Login)
                    },
                    {   path: 'repositories',
                        name: 'repositories',
                        component: () => import('@app/ui/pages/Repositories').then(({ Repositories }) => Repositories)
                    },
                    {   path: "*",
                        name: 'error404',
                        component: Error404
                    }
                ]
            }
        ]
    });
}

/**
 * Add the auth router guard.
 *
 * @param {VueRouter}        router
 * @param {Store<RootState>} store
 *
 * @author François Pluchino <francois.pluchino@gmail.com>
 */
export function routerAddAuthGuard(router: Router, store: Store<RootState>): void {
    router.beforeEach((to: Route, from: Route, next: Function) => {
        let guard = undefined;

        if (to.matched.some(record => record.meta.requiresAuth)) {
            if (!store.getters['auth/isAuthenticated']) {
                guard = {
                    name: 'login',
                    params: {
                        locale: store.state.i18n.locale
                    },
                    query: {
                        redirect: to.fullPath,
                    },
                };
            }
        }

        next(guard);
    });
}
