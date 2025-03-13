import { createWebHashHistory, createRouter } from "vue-router";
import store from "../store/store";
import Layout from "../components/Layout/layout.vue"
import mLayout from "../components/Layout/mLayout.vue"
import home from "../components/home/home.vue"
import SignUp from "../components/SignUp/SignUp.vue";
import SignIn from "../components/SignIn/SignIn.vue";

const routes = [
    {
        path: "/",
        name: "landing",
        component: store.state.display.isMobile ? mLayout : Layout,
        children: [
            {
                path: "",
                name: "home",
                component: home
            },
            {
                path: "sign-up",
                name: "sign-up",
                component: SignUp
            },
            {
                path: "sign-in",
                name: "sign-in",
                component: SignIn
            },
        ]
    },
];

const router = createRouter({
    history: createWebHashHistory('/skill_angola/'),
    routes,
});

router.afterEach(() => {
    window.scrollTo(0, 0)
})

export default router;