<script setup>
import { ref } from 'vue'
import router from '../../router/router';

const step = ref(1);

const languageOptions = [
    {
        label: "English",
        key: "en"
    },
    {
        label: "Português",
        key: "por"
    },
    {
        label: "简体中文",
        key: "cn"
    }
]

function handleSelectLanguage() {
    // next class
}

function handleToSignUpPage() {
    router.push("sign-in")
}

function handleNextStep() {
    step.value = 2;
}
</script>

<template>
    <div>
        <n-flex :justify="'end'">
            <n-dropdown trigger="click" :options="languageOptions" :select="handleSelectLanguage">
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
                    <b>Language</b>
                </n-button>
            </n-dropdown>
        </n-flex>
        <n-flex v-if="step == 1" class="FormContainer" :justify="'center'">
            <n-flex style="height: calc(100vh - 40px - 23px - 48px);" :align="'center'">
                <n-flex vertical :size="48" style="margin-top: -48px">
                    <div>
                        <div class="title">Login Information</div>
                        <div class="subTitle"><n-text :depth="3">Step 1 of 2</n-text></div>
                    </div>
                    <n-flex vertical>
                        <div>
                            <n-form label-placement="left">
                                <n-form-item>
                                    <n-input :size="'large'" placeholder="Username"></n-input>
                                </n-form-item>
                                <n-form-item>
                                    <n-input type="password" :size="'large'" placeholder="Password"></n-input>
                                </n-form-item>
                                <n-form-item>
                                    <n-input type="password" :size="'large'" placeholder="Confirm password"></n-input>
                                </n-form-item>
                            </n-form>
                        </div>
                        <n-flex :justify="'center'">
                            <n-button @click="handleNextStep" :size="'large'" type="primary"
                                style="width: 100%">Next</n-button>
                        </n-flex>
                    </n-flex>
                </n-flex>
            </n-flex>

        </n-flex>
        <n-flex v-else class="FormContainer" :justify="'center'">
            <n-flex style="height: calc(100vh - 40px - 48px);" :align="'center'">
                <n-flex vertical :size="48">
                    <div>
                        <div class="title">Company Information</div>
                        <div class="subTitle"><n-text :depth="3">Step 2 of 2</n-text></div>
                    </div>
                    <n-flex vertical>
                        <div>
                            <n-form style="margin-top: -24px" label-placement="left" label-width="auto" require-mark-placement="right-hanging">
                                <n-form-item :label="'Company name'">
                                    <n-input :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Company address'">
                                    <n-input :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Company description'">
                                    <n-input type="textarea" :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Contact name'">
                                    <n-input :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Contact phone'">
                                    <n-input :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Company email'">
                                    <n-input :size="'large'" placeholder=""></n-input>
                                </n-form-item>
                                <n-form-item :label="'Logo/Storefront'">
                                    <n-upload>
                                        <n-button>Upload file</n-button>
                                    </n-upload>
                                </n-form-item>
                            </n-form>
                        </div>
                        <n-flex :justify="'center'">
                            <n-button @click="handleNextStep" :size="'large'" type="primary"
                                style="width: 100%">Register</n-button>
                        </n-flex>
                    </n-flex>
                </n-flex>
            </n-flex>
        </n-flex>
        <n-flex v-if="step == 1" :justify="'center'">
            <n-button @click="handleToSignUpPage" text>Having an account? &nbsp;<b>Login</b></n-button>
        </n-flex>
    </div>
</template>

<style lang='less' scoped>
.FormContainer {
    width: 1280px;
    margin: 0 auto;

    .title {
        font-size: 32px;
        text-align: center;
        font-weight: bold;
    }

    .subTitle {
        font-size: 24px;
        text-align: center;
    }
}
</style>