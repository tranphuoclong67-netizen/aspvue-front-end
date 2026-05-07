import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import AdminView from '../views/AdminView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        { path: '/', component: HomeView, meta: { requiresAuth: true } },
        { path: '/login', component: LoginView },
        { path: '/register', component: RegisterView },
        { path: '/admin', component: AdminView, meta: { requiresAuth: true, requiresAdmin: true } }
    ]
})

router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (to.meta.requiresAuth && !token) return next('/login')
    if (to.meta.requiresAdmin && role !== 'admin') return next('/')
    next()
})

export default router