import { createWebHashHistory, createRouter } from "vue-router";
import { localUser } from '../assets/auth';
import store from "../store/store";
import Layout from "../components/Layout/layout.vue"
import mLayout from "../components/Layout/mLayout.vue"
import Home from "../components/home/home.vue"
import SignUp from "../components/SignUp/SignUp.vue";
import SignIn from "../components/SignIn/SignIn.vue";
import Applicant from "../components/Applicant/ApplicantView.vue";
import Security from "../components/Security/Security.vue";

const routes = [
    {
        path: "/",
        name: "landing",
        component: store.state.display.isMobile ? mLayout : Layout,
        children: [
            {
                path: "sign-up-admin/:password",
                name: "sign-up-admin",
                component: SignUp,
                props: true
            },
            {
                path: "sign-in",
                name: "sign-in",
                component: SignIn
            },
            {
                path: "",
                name: "home",
                component: Home
            },
            {
                path: "applicant",
                name: "applicant",
                component: Applicant
            },
            {
                path: "security",
                name: "security",
                component: Security,
            },
        ]
    },
];

const router = createRouter({
    history: createWebHashHistory('/skill_angola/'),
    routes,
});

router.beforeEach((to, from, next) => {
    localUser()
        .then(exist => {
            if (exist) {
                if (to.name === 'sign-in') {
                    next({ name: 'home' });
                } else {
                    next();
                }
            } else {
                if (to.name !== 'sign-in' && to.name !== 'sign-up-admin') {
                    next({ name: 'sign-in' });
                } else {
                    next();
                }
            }
        }).catch(err => {
            console.log(err)
        })
});

router.afterEach(() => {
    window.scrollTo(0, 0)
})

export default router;