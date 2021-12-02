import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    // 首頁
    {
        path: '/',
        name: 'home',
        component: () => import('../views/Home.vue')
    },
    {
        path: '/draw',
        name: 'leaflet-draw',
        component: () => import('../views/Leaflet_draw.vue')
    },
    {
        path: '/mymap',
        name: 'mymap',
        component: () => import('../views/Mymap.vue')
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;