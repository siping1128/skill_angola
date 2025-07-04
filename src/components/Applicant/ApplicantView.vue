<script setup>
import { onBeforeMount, watch, ref } from 'vue'
import { decryptData, encryptData, logout } from '../../assets/auth';
import store from '../../store/store';
import baseURL from '../../utils/baseUrl';
import SkillAngolaService from '../../api/SkillAngola.service';
import {
    useMessage
} from "naive-ui"

const message = useMessage();

const t = ref(null);

const readyRender = ref(false);

const showFilterDrawer = ref(false);

const loading = ref(false);

const isAtBottom = ref(0);

const jobs = ref([])

const search = ref('');

const page = ref(0);

const thatsAll = ref(false);

const ApplicantId = 1;

const applicantRecords = ref([])

const recordIds = ref([])

watch(() => store.state.display.text, newVal => {
    t.value = newVal
    readyRender.value = true;
})

watch(search, newVal => {
    if (newVal) {
        jobs.value = [];
        page.value = 0;
    }
})

onBeforeMount(async () => {
    await jobsGetter(page.value, "DESC")
    await recordsGetter(ApplicantId)
    t.value = store.state.display.text
    if (t.value) {
        readyRender.value = true;
    }
})

async function jobsGetter(offset, createdAtSorter, searchInput, isReset) {
    loading.value = true;
    const query = {
        offset: isReset ? 0 : offset
    }
    if (searchInput) {
        query.searchInput = searchInput;
    }
    if (createdAtSorter) {
        query.createdAtSorter = createdAtSorter;
    }
    await SkillAngolaService.findAllJobsByOffset(query)
        .then(res => {
            if (res.status === 201) {
                thatsAll.value = true;
            } else {
                jobs.value = jobs.value.concat(decryptData(res.data.encryptedData))
            }
            loading.value = false;
        }).catch(err => {
            console.log(err)
            loading.value = false;
        })
}

async function recordsGetter(id) {
    SkillAngolaService.findAllRecordsByApplicantId(encryptData(id))
        .then(res => {
            if (res.data.code === 201) {
                applicantRecords.value = decryptData(res.data.encryptedData)
                recordIds.value = applicantRecords.value.map(ar => ar.jobId)
            } else {
                message.error("Sorry, we cannot get your applied records at this moment")
            }
            loading.value = false;
        }).catch(err => {
            console.log(err)
            loading.value = false;
        })
}

async function handleSearch() {
    await jobsGetter(page.value, "DESC", search.value, true)
}

async function handleScroll(e) {
    const targetElement = e.target;
    isAtBottom.value = targetElement.scrollTop + targetElement.clientHeight >= targetElement.scrollHeight - 1;
    if (isAtBottom.value && !thatsAll.value) {
        page.value += 1;
        await jobsGetter(page.value, "DESC", search.value)
    }
}

function handleApply(job) {
    SkillAngolaService.createRecord({
        ApplicantId: encryptData(ApplicantId),
        jobId: encryptData(job.id)
    }).then(res => {
        const code = res.data.code;
        switch (code) {
            case 200:
                const record = decryptData(res.data.encryptedData)
                applicantRecords.value.push(record);
                recordIds.value.push(record.jobId)
                message.success("Successfully applied, good luck!")
                break;
            case 403:
                message.success("This job is no long opened")
                break;
            case 500:
                message.success("Sorry, you cannot apply at this moment")
                break;
            default:
                break;
        }
    }).catch(err => {
        console.log(err)
    })
}
</script>

<template>
    <div v-if="readyRender" class="container">
        <n-flex class="applicantHeader" :justify="'space-between'">
            <n-h2>{{ t.CompanyName }}</n-h2>
            <!-- <n-button size="large" tertiary @click="showFilterDrawer = true">
                <template #icon>
                    <n-icon>
                        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                            viewBox="0 0 512 512">
                            <path d="M16 120h480v48H16z" fill="currentColor"></path>
                            <path d="M96 232h320v48H96z" fill="currentColor"></path>
                            <path d="M192 344h128v48H192z" fill="currentColor"></path>
                        </svg>
                    </n-icon>
                </template>
Filter
</n-button> -->
        </n-flex>
        <n-flex vertical :size="12">
            <div class="search">
                <n-input-group>
                    <n-input size="large" v-model:value="search" :loading="loading"
                        :placeholder="t.Applicant.NInputGroup_NInput_placeholder">
                        <template #prefix>
                            <n-icon>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                    viewBox="0 0 512 512">
                                    <path d="M221.09 64a157.09 157.09 0 1 0 157.09 157.09A157.1 157.1 0 0 0 221.09 64z"
                                        fill="none" stroke="currentColor" stroke-miterlimit="10" stroke-width="32">
                                    </path>
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-miterlimit="10" stroke-width="32" d="M338.29 338.29L448 448"></path>
                                </svg>
                            </n-icon>
                        </template>
                    </n-input>
                    <n-button size="large" @click="handleSearch" :disabled="loading">
                        {{ t.Applicant.NInputGroup_NInput_button }}
                    </n-button>
                </n-input-group>
            </div>
            <n-scrollbar style="max-height: calc(100vh - 35px - 120px);" @scroll="handleScroll">
                <n-flex vertical style="padding-right: 24px" :size="12" :style="{ boxShadow: '' }">
                    <n-card v-for="(job, index) in jobs" :title="job.position">
                        <n-flex vertical>
                            <div>
                                <b>Pay: </b>{{ job.pay }}
                            </div>
                            <div>
                                <b>Required skills: </b>{{ job.skills }}
                            </div>
                            <div>
                                <b>Working hours: </b>{{ job.workingHours }}
                            </div>
                            <n-flex :justify="'end'">
                                <n-button v-if="!recordIds.includes(job.id)" type="primary" @click="handleApply(job)">
                                    {{ "Apply" }}
                                </n-button>
                                <n-text v-else type="success">{{ "Applied" }}</n-text>
                            </n-flex>
                        </n-flex>
                    </n-card>
                    <n-flex :justify="'center'" :align="'center'">
                        <div>
                            <n-text v-if="loading" :depth="3" style="font-size: 10px">
                                {{ "Loading..." }}
                            </n-text>
                            <n-text v-if="thatsAll" :depth="3" style="font-size: 10px">
                                {{ "Already contains all search results, no more jobs found." }}
                            </n-text>
                        </div>
                    </n-flex>
                </n-flex>
            </n-scrollbar>
        </n-flex>
        <!-- <n-drawer v-model:show="showFilterDrawer" :width="'80vw'" :placement="'right'" :auto-focus="false">
            <n-drawer-content title="Filter" closable>
                <n-flex vertical>
                    <n-h3></n-h3>
                </n-flex>
            </n-drawer-content>
        </n-drawer> -->
    </div>
</template>

<style lang='less' scoped>
.container {
    padding: 24px 0 24px 24px;

    .applicantHeader,
    .search {
        padding-right: 24px
    }
}
</style>