<script setup>
import { ref, watch, onBeforeMount, computed } from 'vue'
import router from '../../router/router';
import { languageOptions, handleSelectLanguage } from '../../functions/general';
import store from '../../store/store';
import SkillAngolaService from '../../api/SkillAngola.service';
import {
    useMessage
} from 'naive-ui';

const props = defineProps({
    password: String
})

const isMobile = store.state.display.isMobile

const formRef = ref(null);

const rPasswordFormItemRef = ref(null);

// const step = ref(1);

const message = useMessage();

const readyRender = ref(false);

const model = ref({
    username: null,
    password: null,
    repassword: null
});

const t = ref(null);

const rules = computed(() => {
    return {
        username: [
            {
                required: true,
                validator(rule, value) {
                    if (!value) {
                        return new Error(t.value.SignUp.Step1.NForm_rules_message_username1);
                    } else if (value.length < 6) {
                        return new Error(t.value.SignUp.Step1.NForm_rules_message_username2);
                    } else if (/[^A-Za-z0-9]/.test(value)) {
                        return new Error(t.value.SignUp.Step1.NForm_rules_message_username3);
                    }
                    return true;
                },
                trigger: ["blur"]
            }
        ],
        password: [
            {
                required: true,
                message: () => t.value.SignUp.Step1.NForm_rules_message_password
            }
        ],
        repassword: [
            {
                required: true,
                message: () => t.value.SignUp.Step1.NForm_rules_message_repassword1,
                trigger: ["input", "blur"]
            },
            {
                validator: validatePasswordStartWith,
                message: () => t.value.SignUp.Step1.NForm_rules_message_repassword2,
                trigger: "input"
            },
            {
                validator: validatePasswordSame,
                message: () => t.value.SignUp.Step1.NForm_rules_message_repassword2,
                trigger: ["blur", "password-input"]
            }
        ]
    };
})

watch(() => store.state.display.text, newVal => {
    t.value = newVal
    readyRender.value = true;
})

onBeforeMount(() => {
    if (props.password === '3088') {
        t.value = store.state.display.text
        if (t.value) {
            readyRender.value = true;
        }
    }
})

// function handleToSignUpPage() {
//     router.push("sign-in")
// }

function validatePasswordStartWith(rule, value) {
    return !!model.value.password && model.value.password.startsWith(value) && model.value.password.length >= value.length;
}

function validatePasswordSame(rule, value) {
    return value === model.value.password;
}

function handleRegister(e) {
    e.preventDefault();
    formRef.value?.validate((errors) => {
        if (!errors) {
            const newUser = {
                username: model.value.username,
                password: model.value.password
            }
            SkillAngolaService.createUser(newUser)
                .then(res => {
                    const code = res.data.code;
                    switch (code) {
                        case 201:
                            message.success(t.value.SignUp.Step1.Message_success)
                            reset();
                            break;
                        case 403:
                            message.warning(t.value.SignUp.Step1.Message_warning)
                            break;
                        default:
                            message.error(t.value.SignUp.Step1.Message_error)
                            break;
                    }
                }).catch(err => {
                    console.log(err)
                })
        } else {
            console.log(errors);
        }
    });
}

function handlePasswordInput() {
    if (model.value.repassword) {
        rPasswordFormItemRef.value?.validate({ trigger: "password-input" });
    }
}

function reset() {
    model.value.username = "";
    model.value.password = "";
    model.value.repassword = "";
}
</script>

<template>
    <div v-if="readyRender" class="container">
        <n-flex :justify="'end'">
            <n-dropdown trigger="click" :options="languageOptions" @:select="handleSelectLanguage">
                <n-button round :size="'large'">
                    <template #icon>
                        <n-icon :size="24">
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 24 24">
                                <path
                                    d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14C4.1 13.36 4 12.69 4 12s.1-1.36.26-2h3.38c-.08.66-.14 1.32-.14 2c0 .68.06 1.34.14 2H4.26zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.987 7.987 0 0 1 5.08 16zm2.95-8H5.08a7.987 7.987 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66c-.09-.66-.16-1.32-.16-2c0-.68.07-1.35.16-2h4.68c.09.65.16 1.32.16 2c0 .68-.07 1.34-.16 2zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14c.08-.66.14-1.32.14-2c0-.68-.06-1.34-.14-2h3.38c.16.64.26 1.31.26 2s-.1 1.36-.26 2h-3.38z"
                                    fill="currentColor"></path>
                            </svg>
                        </n-icon>
                    </template>
                    <b>{{ t.ButtonText_changeLang }}</b>
                </n-button>
            </n-dropdown>
        </n-flex>
        <n-flex class="FormContainer" :justify="'center'">
            <n-flex style="height: calc(100vh - 40px - 23px - 48px);" :align="'center'">
                <n-flex vertical :size="48" style="margin-top: -48px">
                    <div>
                        <div class="title" :style="{ fontSize: isMobile ? '28px' : '32px' }">{{ t.SignUp.Step1.Title }}
                        </div>
                        <!-- <div class="subTitle"><n-text :depth="3">{{ t.SignUp.Step1.Subtitle }}</n-text></div> -->
                    </div>
                    <n-flex vertical style="max-width: calc(100vw - 48px); width: 360px">
                        <n-form label-placement="left" ref="formRef" :model="model" :rules="rules">
                            <n-form-item path="username">
                                <n-input :size="'large'" v-model:value="model.username" @keydown.enter.prevent
                                    :placeholder="t.InputPlaceHolder_username"></n-input>
                            </n-form-item>
                            <n-form-item path="password">
                                <n-input type="password" :size="'large'" v-model:value="model.password"
                                    :placeholder="t.InputPlaceHolder_password" @input="handlePasswordInput"
                                    @keydown.enter.prevent></n-input>
                            </n-form-item>
                            <n-form-item ref="rPasswordFormItemRef" first path="repassword">
                                <n-input type="password" :size="'large'" v-model:value="model.repassword"
                                    :placeholder="t.SignUp.Step1.InputPlaceHolder_confirmPassword"
                                    @keydown.enter.prevent :disabled="!model.password"></n-input>
                            </n-form-item>
                        </n-form>
                        <n-flex :justify="'center'">
                            <n-button @click="handleRegister" :size="'large'" type="primary" style="width: 100%">
                                {{ t.SignUp.Step1.ButtonText_Next }}
                            </n-button>
                        </n-flex>
                    </n-flex>
                </n-flex>
            </n-flex>
        </n-flex>
    </div>
</template>

<style lang='less' scoped>
.container {
    padding: 24px
}

.FormContainer {
    max-width: 100%;
    width: 1280px;
    margin: 0 auto;

    .title {
        text-align: center;
        font-weight: bold;
    }

    .subTitle {
        font-size: 24px;
        text-align: center;
    }
}
</style>