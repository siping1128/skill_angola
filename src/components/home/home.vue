<script setup>
import { ref, h, watch, onBeforeMount, computed } from 'vue'
import {
    NAvatar,
    NBadge,
    NButton,
    NFlex,
    NIcon,
    NImage,
    NTag,
    NText,
    NTime,
    useMessage
} from 'naive-ui';
import { decryptData, encryptData, logout } from '../../assets/auth';
import router from '../../router/router';
import store from '../../store/store';
import baseURL from '../../utils/baseUrl';
import generator from 'generate-password-ts';
import SkillAngolaService from '../../api/SkillAngola.service';
import { languageOptions, handleSelectLanguage } from '../../functions/general';
import environment from '../../utils/mode';

const message = useMessage();

const readyRender = ref(false);

const isMobile = store.state.display.isMobile

const logoFolderUrl = 'https://file.scholarhills.com/img/student/siping/SA/companyLogo/';

const jobTableHeight = 'calc(100vh - 98px - 89px)'

const renderIcon = (icon) => {
    return () => {
        return h(NIcon, { depth: 2, size: "20", innerHTML: icon })
    }
};

const t = ref(null);

const loading = ref(false);
const dataTableLoading = ref(true);
const copied = ref(false);

const userUid = ref("")

const currentJob = ref(null);
const currentApplicant = ref(null);
const currentCompany = ref(null);
const currentCompanyInfo = ref(null);
const currentRecord = ref(null);

const comment = ref("");

////////////////////////////////
//                            //
//       Mobile display       //
//                            //
////////////////////////////////

const mobileMenuActive = ref(false);

const mobileSearch = ref("");

const mobileFilterOption = ref([0, 1]);

////////////////////////////////
//                            //
//       Modal Display        //
//                            //
////////////////////////////////

const modalMode = ref(0)

const commentMode = ref(false);

const showJobModal = ref(false);
const showApplicantsModal = ref(false);
const showApplicantDetailModal = ref(false);
const showCompanyModal = ref(false)
const showManageCompanyModal = ref(false);

const showCompanyDropdown = ref(false)

////////////////////////////////
//                            //
//      Create a company      //
//                            //
////////////////////////////////

const uploadRef = ref(null)

const uploadReady = ref(false);

const companyFormRef = ref(null);

const companyModel = ref({
    name: null,
    address: null,
    description: null,
    contactName: null,
    contactPhone: null,
    email: null,
    logo: null,
});

const companyRules = computed(() => {
    return {
        name: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_name
        },
        address: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_address
        },
        description: {
            required: true,
            validator(rule, value) {
                if (!value) {
                    return new Error(t.value.APP.Company.NForm_rules_message_description_1)
                }
                else if (value.length > 4000) {
                    return new Error(t.value.APP.Company.NForm_rules_message_description_2)
                }
                return true
            },
            trigger: ['blur', 'input']
        },
        contactName: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_contactName
        },
        contactPhone: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_contactPhone
        },
        email: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_email
        }
    }
})

const fileList = ref([])

////////////////////////////////
//                            //
//        Create a job        //
//                            //
////////////////////////////////

const jobs = ref([])

const jobFormRef = ref(null);

const jobModel = ref({
    position: null,
    description: null,
    pay: null,
    skills: null,
    workingLocation: null,
    workingHours: null
});

const jobRules = computed(() => {
    return {
        position: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_position
        },
        description: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_description
        },
        pay: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_pay
        },
        skills: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_skills
        },
        workingLocation: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_workingLocation
        },
        workingHours: {
            required: true,
            trigger: ['blur', 'input'],
            message: t.value.APP.Company.NForm_rules_message_workingHours
        }
    }
})

const applicantRecords = ref([])

////////////////////////////////
//                            //
//     Data table columns     //
//                            //
////////////////////////////////

const jobColumns = computed(() => {
    return [
        {
            title: t.value.APP.Job.NDataTable_columns_1,
            key: 'createdAt',
            defaultSortOrder: false,
            fixed: 'left',
            width: 180,
            sorter: {
                compare: (a, b) => (new Date(b.createdAt)).getTime() - (new Date(a.createdAt)).getTime(),
                multiple: 3
            },
            render(row) {
                return h(NTime, { time: new Date(row.createdAt) })
            }
        },
        {
            title: t.value.APP.Job.NDataTable_columns_2,
            key: 'status',
            defaultSortOrder: 'descend',
            sorter: {
                compare: (a, b) => a.status - b.status,
                multiple: 2
            },
            defaultFilterOptionValues: [1, 0],
            filterOptions: [
                {
                    label: t.value.APP.Job.NDataTable_columns_2_FilterOption1,
                    value: 1
                },
                {
                    label: t.value.APP.Job.NDataTable_columns_2_FilterOption2,
                    value: 0
                }
            ],
            filter(value, row) {
                return row.status === value;
            },
            render(row) {
                return h(NTag,
                    { type: row.status ? 'info' : 'error', size: 'small' },
                    { default: () => row.status ? t.value.APP.Job.NDataTable_columns_2_FilterOption1 : t.value.APP.Job.NDataTable_columns_2_FilterOption2 })
            }
        },
        {
            title: t.value.APP.Job.NDataTable_columns_3,
            key: 'position',
        },
        {
            title: t.value.APP.Job.NDataTable_columns_4,
            key: 'pay'
        },
        {
            title: t.value.APP.Job.NDataTable_columns_5,
            key: 'workingHours'
        },
        {
            title: t.value.APP.Job.NDataTable_columns_6,
            key: 'actions',
            fixed: 'right',
            width: 240,
            render(row) {
                return h(NFlex, null, {
                    default: () => [
                        h(
                            NBadge,
                            {
                                processing: true,
                                value: row.records.length
                            },
                            {
                                default: () => h(
                                    NButton,
                                    {
                                        onClick: () => viewApplicants(row),
                                        size: 'small',
                                        disabled: loading.value,
                                    },
                                    { default: () => t.value.APP.Job.NDataTable_columns_6_NButton2 }
                                )
                            }
                        ),
                        h(
                            NButton,
                            {
                                onClick: () => viewJobDetail(row),
                                size: 'small',
                            },
                            { default: () => t.value.APP.Job.NDataTable_columns_6_NButton1 }
                        )
                    ]
                })
            }
        },
        {
            key: 'remove',
            fixed: 'right',
            width: 120,
            render(row) {
                return h(
                    NButton,
                    {
                        // type: row.status ? 'error' : 'info',
                        onClick: () => handleChangeStatus(row),
                        size: 'small',
                        quaternary: true
                    },
                    { default: () => row.status ? t.value.APP.Job.NDataTable_columns_6_NButton3 : t.value.APP.Job.NDataTable_columns_6_NButton4 }
                )
            }
        }
    ]
})

const applicantColumns = computed(() => {
    return [
        {
            title: t.value.Applicant.NDataTable_columns_1,
            key: 'createdAt',
            fixed: 'left',
            width: 180,
            render(row) {
                return h(NTime, { time: new Date(row.createdAt) })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_2,
            key: 'firstName',
            render(row) {
                return h("div", null, { default: () => row.Applicant.firstName })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_3,
            key: 'lastName',
            render(row) {
                return h("div", null, { default: () => row.Applicant.lastName })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_4,
            key: 'age',
            render(row) {
                return h("div", null, { default: () => row.Applicant.age })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_5,
            key: 'education',
            render(row) {
                return h(NTag, null,
                    { default: () => matchEduction(row.Applicant.education) })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_6,
            key: 'skill',
            render(row) {
                return h("div", null, { default: () => row.Applicant.skill })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_7,
            key: 'photoUrl',
            render(row) {
                return h(NAvatar, { src: row.Applicant.photoUrl })
            }
        },
        {
            title: t.value.Applicant.NDataTable_columns_8,
            key: 'actions',
            fixed: 'right',
            width: 360,
            render(row) {
                return h(NFlex, { size: 12 }, {
                    default: () => [
                        h(
                            NButton,
                            {
                                onClick: () => viewApplicantDetail(row, false),
                            },
                            { default: () => t.value.Applicant.NDataTable_columns_8_NButton1 }
                        ),
                        h(
                            NButton,
                            {
                                tag: 'a',
                                href: `tel:${row.Applicant.telephone}`,
                            },
                            { default: () => t.value.Applicant.NDataTable_columns_8_NButton2 }
                        ),
                        h(
                            NButton,
                            {
                                onClick: () => viewApplicantDetail(row, true),
                            },
                            { default: () => t.value.Applicant.NDataTable_columns_8_NButton3 }
                        )
                    ]
                })
            }
        },
        {
            key: 'HireOrDecline',
            width: 200,
            fixed: 'right',
            render(row) {
                return h(NFlex, { size: 12 }, {
                    default: () => [
                        row.status == 0 ? null : h(
                            NButton,
                            {
                                type: 'success',
                                secondary: row.status != 2,
                                onClick: () => handleUpdateRecord(row, 2, row.comment),
                                style: { padding: '0 24px' },
                                disabled: row.status == 2
                            },
                            {
                                default: () => {
                                    return row.status == 2 ? t.value.Applicant.NDataTable_columns_9_NButton1 : t.value.Applicant.NDataTable_columns_9_NButton2
                                }
                            }
                        ),
                        row.status == 2 ? null : h(
                            NButton,
                            {
                                type: 'error',
                                secondary: row.status != 0,
                                onClick: () => handleUpdateRecord(row, 0, row.comment),
                                disabled: row.status == 0
                            },
                            { default: () => row.status == 0 ? t.value.Applicant.NDataTable_columns_9_NButton3 : t.value.Applicant.NDataTable_columns_9_NButton4 }
                        ),
                        row.status == 1 ? null : h(
                            NButton,
                            {
                                text: true,
                                onClick: () => handleUpdateRecord(row, 1, row.comment),
                            },
                            {
                                default: () => t.value.Applicant.NDataTable_columns_9_NButton5
                            }
                        )
                    ]
                })
            }
        }
    ]
})

const companyColumns = computed(() => {
    return [
        {
            title: t.value.APP.Company.NDataTable_columns_1,
            key: 'name',
            fixed: 'left',
            width: 240,
            render(row) {
                return h(
                    'div',
                    {
                        style: 'display: flex; align-items: center;'
                    },
                    [
                        h(NAvatar, {
                            style: 'margin-right: 12px;',
                            src: logoFolderUrl + row.logo
                        }),
                        h('div', null, { default: () => row.name })
                    ]
                )
            }
        },
        {
            title: t.value.APP.Company.NDataTable_columns_2,
            key: 'address',
            fixed: 'left',
            width: 240,
        },
        {
            title: t.value.APP.Company.NDataTable_columns_3,
            key: 'contactName'
        },
        {
            title: t.value.APP.Company.NDataTable_columns_4,
            key: 'contactPhone'
        },
        {
            title: t.value.APP.Company.NDataTable_columns_5,
            key: 'email'
        },
        {
            key: t.value.APP.Company.NDataTable_columns_6,
            fixed: 'right',
            width: 240,
            render(row) {
                return h(NFlex, { size: 48 }, {
                    default: () => [
                        h(
                            NButton,
                            {
                                onClick: () => viewCompanyDetail(row),
                            },
                            { default: () => t.value.APP.Company.NDataTable_columns_6_NButton }
                        ),
                    ]
                })
            }
        }
    ]
})

////////////////////////////////
//                            //
//          Dropdown          //
//                            //
////////////////////////////////

const companies = ref([])

const settingOptions = computed(() => {
    return [
        {
            label: t.value.APP.NDropDown_label_changePassword,
            key: 'cp',
            icon: renderIcon(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32"><circle cx="21.5" cy="7.5" r="1.5" fill="currentColor"></circle><path d="M14.414 20H9v-5.414l6.03-6.03A5.352 5.352 0 0 1 15 8a6 6 0 1 1 6 6a5.358 5.358 0 0 1-.556-.03zM11 18h2.586l6.17-6.17l.518.095A3.935 3.935 0 0 0 21 12a4.05 4.05 0 1 0-3.925-3.273l.095.517l-6.17 6.17z" fill="currentColor"></path><path d="M28 20h-9v2h9v6H4v-6h2v-2H4a2.002 2.002 0 0 0-2 2v6a2.002 2.002 0 0 0 2 2h24a2.002 2.002 0 0 0 2-2v-6a2.002 2.002 0 0 0-2-2z" fill="currentColor"></path><circle cx="7" cy="25" r="1" fill="currentColor"></circle></svg>`)
        },
        {
            label: t.value.APP.NDropDown_label_logout,
            key: 'lo',
            icon: renderIcon(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512"><path d="M304 336v40a40 40 0 0 1-40 40H104a40 40 0 0 1-40-40V136a40 40 0 0 1 40-40h152c22.09 0 48 17.91 48 40v40" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M368 336l80-80l-80-80"></path><path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="32" d="M176 256h256"></path></svg>`)
        }
    ]
})

const renderCompanyDropdownIcon = (option) => {
    return option.key != 'manage' ? h(NAvatar, {
        size: 24,
        src: 'https://file.scholarhills.com/img/student/siping/SA/companyLogo/' + option.key
    }) : h(NIcon, { depth: 2, size: "20", innerHTML: `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024"><path d="M464 144H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H212V212h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V160c0-8.8-7.2-16-16-16zm-52 268H612V212h200v200zM464 544H160c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H212V612h200v200zm452-268H560c-8.8 0-16 7.2-16 16v304c0 8.8 7.2 16 16 16h304c8.8 0 16-7.2 16-16V560c0-8.8-7.2-16-16-16zm-52 268H612V612h200v200z" fill="currentColor"></path></svg>` })
}

const companyOptions = computed(() => {
    const options = [
        {
            key: 'header-divider',
            type: 'divider'
        },
        {
            label: t.value.APP.Company.NDropDown_companyOptions_manage,
            key: 'manage'
        }
    ];

    if (companies.value && companies.value.length) {
        companies.value.forEach(company => {
            options.unshift({
                label: company.name,
                key: company.logo,
                disabled: company.uid === currentCompany.value.uid
            });
        });
    }
    return options;
})

const wss = ref(null)

////////////////////////////////
//                            //
//         CONST END          //
//                            //
////////////////////////////////

watch(() => store.state.display.text, newVal => {
    t.value = newVal
    readyRender.value = true;
})

onBeforeMount(() => {
    const SAToken = localStorage.getItem('SAToken')
    if (SAToken) {
        userUid.value = decryptData(SAToken)
    }
    const companyUid = localStorage.getItem('SACURC')
    if (companyUid) {
        companyGetter(companyUid)
    } else {
        const userUid = localStorage.getItem("SAToken")
        SkillAngolaService.findAllCompaniesByUserUid(userUid)
            .then(res => {
                const code = res.data.code;
                switch (code) {
                    case 201:
                        companies.value = decryptData(res.data.encryptedData)
                        currentCompany.value = companies.value[0]
                        const encryptedCompanyUid = encryptData(currentCompany.value.uid)
                        localStorage.setItem("SACURC", encryptedCompanyUid)
                        companyGetter(encryptedCompanyUid)
                        break;
                    case 403:
                        break;
                    case 404:
                        t.value = store.state.display.text
                        if (t.value) {
                            readyRender.value = true;
                        }
                    case 500:
                        break;
                    default:
                        break;
                }
            })
            .catch(err => {
                console.log(err)
            })
    }
})

function matchEduction(n) {
    var res = ""
    switch (n) {
        case 0:
            res = "Primary school"
            break;
        case 1:
            res = "Secondary school"
            break;
        case 2:
            res = "High school"
            break;
        case 3:
            res = "Bachelor"
            break;
        case 4:
            res = "Master"
            break;
        case 5:
            res = "Ph.D"
            break;
        default:
            res = "Unknown"
            break;
    }
    return res;
}

////////////////////////////////
//                            //
//     Data table actions     //
//                            //
////////////////////////////////


function viewJobDetail(job) {
    jobModel.value.position = job.position
    jobModel.value.description = job.description
    jobModel.value.pay = job.pay
    jobModel.value.skills = job.skills
    jobModel.value.workingLocation = job.workingLocation
    jobModel.value.workingHours = job.workingHours
    currentJob.value = job;
    openJobModal("edit")
}

async function viewApplicants(job) {
    currentJob.value = job
    await recordGetter(job)
    showApplicantsModal.value = true
}

function viewApplicantDetail(record, action) {
    commentMode.value = action
    currentRecord.value = record
    currentApplicant.value = record.Applicant
    comment.value = record.comment
    showApplicantDetailModal.value = true
}

function handleChangeStatus(job) {
    const data = {
        status: job.status
    }
    if (job.status) {
        data.status = 0
    } else {
        data.status = 1
    }
    SkillAngolaService.updateJob(encryptData(job.id), data)
        .then(res => {
            const code = res.data.code;
            switch (code) {
                case 201:
                    const decryptedData = decryptData(res.data.encryptedData);
                    const index = jobs.value.findIndex(c => c.id === decryptedData.id);
                    jobs.value[index] = decryptedData;
                    message.success(t.value.APP.Job.NForm_edit_success);
                    loading.value = false;
                    break;
                case 404:
                    message.error(t.value.APP.Job.NForm_edit_error);
                    loading.value = false;
                    break;
                default:
                    loading.value = false;
                    break;
            }
        }).catch(err => {
            message.error(t.value.APP.Job.NForm_edit_error);
            loading.value = false;
        })
}

function viewCompanyDetail(row) {
    companyModel.value.name = row.name;
    companyModel.value.address = row.address;
    companyModel.value.description = row.description;
    companyModel.value.contactName = row.contactName;
    companyModel.value.contactPhone = row.contactPhone;
    companyModel.value.email = row.email;
    companyModel.value.logo = row.logo;
    currentCompanyInfo.value = row;
    openCompanyModal("edit");
}

////////////////////////////////
//                            //
//     Dropdown functions     //
//                            //
////////////////////////////////

function handleClickCompanyDropdown() {
    loading.value = true;
    const userUid = localStorage.getItem("SAToken")
    SkillAngolaService.findAllCompaniesByUserUid(userUid)
        .then(res => {
            const code = res.data.code;
            switch (code) {
                case 201:
                    companies.value = decryptData(res.data.encryptedData)
                    break;
                case 403:
                    break;
                case 404:
                    t.value = store.state.display.text
                    if (t.value) {
                        readyRender.value = true;
                    }
                    break;
                case 500:
                    break;
                default:
                    break;
            }
            showCompanyDropdown.value = true;
            loading.value = false;
        })
        .catch(err => {
            console.log(err)
            loading.value = false;
        })
}

function handleCompanyOptionsSelect(key) {
    switch (key) {
        case 'manage':
            showManageCompanyModal.value = true
            break;
        default:
            currentCompany.value = companies.value.find(c => c.logo === key)
            localStorage.setItem("SACURC", encryptData(currentCompany.value.uid))
            companyGetter(encryptData(currentCompany.value.uid))
            message.success(t.value.APP.Company.NDropDown_message_success_switchCompany + currentCompany.value.name)
            break;
    }
    showCompanyDropdown.value = false;
}

function companyGetter(companyUid) {
    if (environment == 'dev') {
        wss.value = new WebSocket(`ws://localhost:5174/wss/Siping/SA/company/${companyUid}`)
    } else if (environment == 'build') {
        wss.value = new WebSocket(`wss://www.hillib.com/wss/Siping/SA/company/${companyUid}`)
    }
    wss.value.onopen = () => {
        console.log("WebSocket connection established...");
    }
    wss.value.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        switch (msg.code) {
            case 201:
                switch (msg.type) {
                    case 'new-record':
                        const newRecord = decryptData(msg.encryptedData);
                        const index = jobs.value.findIndex(job => job.id === newRecord.jobId);
                        jobs.value[index].records.unshift(newRecord)
                        break;
                    default:
                        currentCompany.value = decryptData(msg.encryptedData)
                        jobs.value = currentCompany.value.jobs
                        dataTableLoading.value = false;
                        break;
                }
                break;
            case 404:
                break;
            case 500:
                break;
            default:
                break;
        }
        t.value = store.state.display.text
        if (t.value) {
            readyRender.value = true;
        }
    };
    wss.value.onerror = (err) => {
        console.error("WebSocket error:", err);
    };
}

function handleCompanyDropdownClickoutside() {
    showCompanyDropdown.value = false;
}

function handleUserOptionsSelect(key) {
    switch (key) {
        case 'cp':
            router.push({ name: 'security' })
            break;
        case 'lo':
            logout()
            break;
        default:
            break;
    }
}

////////////////////////////////
//                            //
//     Company functions      //
//                            //
////////////////////////////////

function openCompanyModal(action) {
    switch (action) {
        case 'create':
            companyModel.value = {
                name: null,
                address: null,
                description: null,
                contactName: null,
                contactPhone: null,
                email: null,
                logo: null,
            };
            fileList.value = []
            modalMode.value = 0;
            uploadReady.value = false;
            break;
        case 'edit':
            modalMode.value = 1;
            fileList.value[0] = {
                id: '1',
                name: companyModel.value.logo,
                status: 'finished',
                url: logoFolderUrl + companyModel.value.logo,
            };
            uploadReady.value = true;
            break;
        default:
            modalMode.value = 2;
            break;
    }
    showCompanyModal.value = true;
}

function handleCreateOrUpdateCompany(e) {
    e.preventDefault();
    loading.value = true;
    companyFormRef.value?.validate((errors) => {
        if (!errors) {
            if (uploadReady.value) {
                uploadRef.value?.submit()
                switch (modalMode.value) {
                    case 0:
                        SkillAngolaService.createCompany({
                            userUid: encryptData(userUid.value),
                            ...companyModel.value,
                        }).then(res => {
                            const code = res.data.code;
                            switch (code) {
                                case 201:
                                    const decryptedData = decryptData(res.data.encryptedData);
                                    currentCompany.value = decryptedData;
                                    companies.value.unshift(currentCompany.value)
                                    localStorage.setItem("SACURC", encryptData(currentCompany.value.uid))
                                    message.success(t.value.APP.Company.NForm_create_success + currentCompany.value.name)
                                    loading.value = false;
                                    showCompanyModal.value = false;
                                    dataTableLoading.value = false;
                                    break;
                                case 404:
                                    message.error(t.value.APP.Company.NForm_create_error)
                                    loading.value = false;
                                    setTimeout(() => {
                                        SkillAngolaService.deleteLogo(companyModel.value.logo)
                                    }, 3000);
                                    break;
                                default:
                                    loading.value = false;
                                    break;
                            }
                        }).catch(err => {
                            message.error(t.value.APP.Company.NForm_create_error)
                            loading.value = false;
                            setTimeout(() => {
                                SkillAngolaService.deleteLogo(companyModel.value.logo)
                            }, 3000);
                        })
                        break;
                    case 1:
                        SkillAngolaService.updateCompany(encryptData(currentCompanyInfo.value.uid), companyModel.value)
                            .then(res => {
                                const code = res.data.code;
                                switch (code) {
                                    case 201:
                                        const decryptedData = decryptData(res.data.encryptedData);
                                        const index = companies.value.findIndex(c => c.uid === decryptedData.uid)
                                        companies.value[index] = decryptedData;
                                        message.success(t.value.APP.Company.NForm_edit_success)
                                        loading.value = false;
                                        break;
                                    case 404:
                                        message.error(t.value.APP.Company.NForm_edit_error)
                                        loading.value = false;
                                        break;
                                    default:
                                        loading.value = false;
                                        break;
                                }
                            }).catch(err => {
                                message.error(t.value.APP.Company.NForm_edit_error)
                                loading.value = false;
                            })
                        break;
                    default:
                        break;
                }
            } else {
                message.error(t.value.APP.Company.NForm_rules_message_logo);
                loading.value = false;
            }
        } else {
            console.log(errors);
            message.error(t.value.APP.Company.NForm_create_validate_error);
            loading.value = false;
        }
    });
}

async function beforeUpload(data) {
    const file = data.file.file;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;

    if (!allowedTypes.includes(file.type)) {
        message.error(t.value.APP.Company.NUpload_BeforeUpload_message_error1);
        return false;
    }

    if (file.size > maxSize) {
        message.error(t.value.APP.Company.NUpload_BeforeUpload_message_error2);
        return false;
    }

    var key = generator.generate({
        length: 24,
        numbers: true
    });
    companyModel.value.logo = Date.now() + '-' + key;

    let extension = '';
    switch (file.type) {
        case 'image/jpeg':
            extension = '.jpg';
            break;
        case 'image/png':
            extension = '.png';
            break;
        case 'image/webp':
            extension = '.webp';
            break;
        default:
            break;
    }
    companyModel.value.logo = companyModel.value.logo + extension

    uploadReady.value = true;
    return true;
};

function handleUploadRemove() {
    uploadReady.value = false;
}

////////////////////////////////
//                            //
//       Job functions        //
//                            //
////////////////////////////////

function openJobModal(action) {
    switch (action) {
        case 'create':
            jobModel.value = {
                position: null,
                description: null,
                pay: null,
                skills: null,
                workingLocation: null,
                workingHours: null
            };
            modalMode.value = 0;
            break;
        case 'edit':
            modalMode.value = 1;
            break;
        default:
            modalMode.value = 2;
            break;
    }
    showJobModal.value = true;
}

function handleCreateOrUpdateJob(e) {
    e.preventDefault();
    loading.value = true;
    jobFormRef.value?.validate((errors) => {
        if (!errors) {
            switch (modalMode.value) {
                case 0:
                    SkillAngolaService.createJob(
                        encryptData(currentCompany.value.uid), jobModel.value).then(res => {
                            const code = res.data.code;
                            switch (code) {
                                case 201:
                                    const decryptedData = decryptData(res.data.encryptedData);
                                    decryptedData.records = [];
                                    jobs.value.unshift(decryptedData)
                                    message.success(t.value.APP.Job.NForm_create_success1 + decryptedData.position + t.value.APP.Job.NForm_create_success + currentCompany.value.name)
                                    loading.value = false;
                                    showJobModal.value = false;
                                    break;
                                case 404:
                                    message.error(t.value.APP.Job.NForm_create_error)
                                    loading.value = false;
                                    break;
                                default:
                                    loading.value = false;
                                    break;
                            }
                        }).catch(err => {
                            message.error(t.value.APP.Job.NForm_create_error)
                            loading.value = false;
                        })
                    break;
                case 1:
                    SkillAngolaService.updateJob(encryptData(currentJob.value.id), jobModel.value)
                        .then(res => {
                            const code = res.data.code;
                            switch (code) {
                                case 201:
                                    const decryptedData = decryptData(res.data.encryptedData);
                                    const index = jobs.value.findIndex(c => c.id === decryptedData.id);
                                    jobs.value[index] = decryptedData;
                                    message.success(t.value.APP.Job.NForm_edit_success);
                                    loading.value = false;
                                    break;
                                case 404:
                                    message.error(t.value.APP.Job.NForm_edit_error);
                                    loading.value = false;
                                    break;
                                default:
                                    loading.value = false;
                                    break;
                            }
                        }).catch(err => {
                            message.error(t.value.APP.Job.NForm_edit_error);
                            loading.value = false;
                        })
                    break;
                default:
                    break;
            }
        } else {
            console.log(errors);
            message.error(t.value.APP.Company.NForm_create_validate_error);
            loading.value = false;
        }
    });
}

////////////////////////////////
//                            //
//      Record functions      //
//                            //
////////////////////////////////

async function recordGetter(job) {
    loading.value = true;
    dataTableLoading.value = true
    SkillAngolaService.findAllRecordsByJobId(encryptData(job.id))
        .then(res => {
            if (res.data.code === 201) {
                applicantRecords.value = decryptData(res.data.encryptedData)
            } else {
                message.error("Sorry, we cannot get this job's records at this moment")
            }
            loading.value = false;
            dataTableLoading.value = false;
        }).catch(err => {
            console.log(err)
            loading.value = false;
            dataTableLoading.value = false;
        })
}

////////////////////////////////
//                            //
//      Record functions      //
//                            //
////////////////////////////////

function closeApplicantsModal() {
    const index = jobs.value.findIndex(job => job.id === currentJob.value.id);
    jobs.value[index].records = applicantRecords.value.filter(ar => ar.status === 1)
}

async function copyPhone() {
    try {
        await navigator.clipboard.writeText(currentApplicant.value.telephone);
        copied.value = true
        setTimeout(() => {
            copied.value = false
        }, 2000);
    } catch (err) {
        console.error("Failed to copy: ", err);
    }
}

async function handleUpdateRecord(record, newStatus, newComment) {
    loading.value = true
    const newData = {}
    if (newStatus != record.status) {
        newData.status = newStatus
    }
    if (newComment != record.comment) {
        newData.comment = newComment
        currentRecord.value.comment = newComment
    }
    await SkillAngolaService.updateRecord(encryptData(record.id), newData)
        .then(res => {
            const code = res.data.code;
            switch (code) {
                case 201:
                    const decryptedData = decryptData(res.data.encryptedData);
                    const index = applicantRecords.value.findIndex(r => r.id === decryptedData.id)
                    applicantRecords.value[index].status = decryptedData.status;
                    applicantRecords.value[index].comment = decryptedData.comment;
                    message.success(t.value.Applicant.NDataTable_updateRecord_success)
                    loading.value = false;
                    break;
                case 404:
                    message.error(t.value.Applicant.NDataTable_updateRecord_error)
                    loading.value = false;
                    break;
                default:
                    loading.value = false;
                    break;
            }
        }).catch(err => {
            message.error(t.value.Applicant.NDataTable_updateRecord_error)
            loading.value = false;
        })
    if (isMobile) {
        modalMode.value = 0;
    }
}

function mobileHandleComment(record) {
    currentRecord.value = record;
    comment.value = record.comment;
    modalMode.value = 1;
}
</script>

<template>
    <div v-if="readyRender" class="container">
        <n-layout>
            <n-layout-header class="header" bordered>
                <n-flex :justify="'space-between'" :align="'center'">
                    <div>
                        <div style="font-size: 24px"><b>Skill Angola™</b></div>
                    </div>
                    <div v-if="isMobile">
                        <n-button text @click="mobileMenuActive = true">
                            <template #icon>
                                <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                    viewBox="0 0 512 512">
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-miterlimit="10" stroke-width="48" d="M88 152h336"></path>
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-miterlimit="10" stroke-width="48" d="M88 256h336"></path>
                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                        stroke-miterlimit="10" stroke-width="48" d="M88 360h336"></path>
                                </svg>
                            </template>
                            Menu
                        </n-button>
                    </div>
                    <div v-else>
                        <n-flex :align="'center'" :size="24">
                            <n-flex :size="4">
                                <n-dropdown :show="showCompanyDropdown" v-if="currentCompany" :options="companyOptions"
                                    @select="handleCompanyOptionsSelect" :render-icon="renderCompanyDropdownIcon"
                                    @clickoutside="handleCompanyDropdownClickoutside">
                                    <n-button size="large" quaternary @click="handleClickCompanyDropdown"
                                        :loading="loading">
                                        {{ currentCompany.name }}
                                    </n-button>
                                </n-dropdown>
                                <n-dropdown trigger="click" :options="languageOptions" @select="handleSelectLanguage">
                                    <n-button :size="'large'" quaternary circle>
                                        <template #icon>
                                            <n-icon :size="24">
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32" d="M48 112h288">
                                                    </path>
                                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32" d="M192 64v48"></path>
                                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32"
                                                        d="M272 448l96-224l96 224"></path>
                                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32" d="M301.5 384h133">
                                                    </path>
                                                    <path d="M281.3 112S257 206 199 277S80 384 80 384" fill="none"
                                                        stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32"></path>
                                                    <path d="M256 336s-35-27-72-75s-56-85-56-85" fill="none"
                                                        stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32"></path>
                                                </svg>
                                            </n-icon>
                                        </template>
                                    </n-button>
                                </n-dropdown>
                                <n-dropdown trigger="click" :options="settingOptions" @select="handleUserOptionsSelect">
                                    <n-button size="large" circle quaternary>
                                        <template #icon>
                                            <n-icon>
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                                                    <path
                                                        d="M262.29 192.31a64 64 0 1 0 57.4 57.4a64.13 64.13 0 0 0-57.4-57.4zM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22a155.3 155.3 0 0 1-21.46-12.57a16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22a155.3 155.3 0 0 1 21.46 12.57a16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47z"
                                                        fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32"></path>
                                                </svg>
                                            </n-icon>
                                        </template>
                                    </n-button>
                                </n-dropdown>
                            </n-flex>
                            <n-button v-if="currentCompany" tertiary type="primary" @click="openJobModal('create')">
                                <template #icon>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                        viewBox="0 0 512 512">
                                        <path fill="none" stroke="currentColor" stroke-linecap="square"
                                            stroke-linejoin="round" stroke-width="32" d="M256 112v288"></path>
                                        <path fill="none" stroke="currentColor" stroke-linecap="square"
                                            stroke-linejoin="round" stroke-width="32" d="M400 256H112"></path>
                                    </svg>
                                </template>
                                {{ t.APP.Text_NButton_PostAJob }}
                            </n-button>
                        </n-flex>
                    </div>
                </n-flex>
            </n-layout-header>
            <n-layout-content class="content">
                <div v-if="currentCompany">
                    <n-layout v-if="isMobile">
                        <n-layout-header style="padding: 24px">
                            <n-checkbox-group v-model:value="mobileFilterOption">
                                <n-flex>
                                    <n-checkbox :value="1" :label="t.APP.Job.NDataTable_columns_2_FilterOption1" />
                                    <n-checkbox :value="0" :label="t.APP.Job.NDataTable_columns_2_FilterOption2" />
                                </n-flex>
                            </n-checkbox-group>
                        </n-layout-header>
                        <n-layout-content style="height: calc(100vh - 89px - 71px)">
                            <n-flex vertical style="padding: 0 24px 24px 24px">
                                <n-card
                                    v-for="job in jobs.filter(j => mobileFilterOption.includes(j.status)).sort((a, b) => b.status - a.status)">
                                    <template #header>
                                        <h2>{{ job.position }}</h2>
                                    </template>
                                    <template #header-extra>
                                        <n-tag :type="job.status ? 'info' : 'error'">
                                            {{ job.status ? t.APP.Job.NDataTable_columns_2_FilterOption1 :
                                                t.APP.Job.NDataTable_columns_2_FilterOption2 }}
                                        </n-tag>
                                    </template>
                                    <n-flex vertical :size="24" style="margin-bottom: 24px">
                                        <n-flex vertical>
                                            <b>{{ t.APP.Job.NFormItem_description_label }}</b>
                                            <n-text>{{ job.description }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Job.NFormItem_Pay_label }}</b>
                                            <n-text>{{ job.pay }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Job.NFormItem_skillsRequired_label }}</b>
                                            <n-text>{{ job.skills }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Job.NFormItem_workingHours_label }}</b>
                                            <n-text>{{ job.workingHours }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Job.NFormItem_workingLocation_label }}</b>
                                            <n-text>{{ job.workingLocation }}</n-text>
                                        </n-flex>
                                    </n-flex>
                                    <template #footer>
                                        <n-flex :justify="'space-between'">
                                            <n-badge processing :value="job.records.length">
                                                <n-button @click="viewApplicants(job)">
                                                    {{ t.APP.Job.NDataTable_columns_6_NButton2 }}
                                                </n-button>
                                            </n-badge>
                                            <n-button @click="viewJobDetail(job)">
                                                {{ t.APP.Job.NDataTable_columns_6_NButton1 }}
                                            </n-button>
                                            <n-button @click="handleChangeStatus(job)">
                                                {{ job.status ? t.APP.Job.NDataTable_columns_6_NButton3
                                                    : t.APP.Job.NDataTable_columns_6_NButton4 }}
                                            </n-button>
                                        </n-flex>
                                    </template>
                                </n-card>
                            </n-flex>
                        </n-layout-content>
                    </n-layout>
                    <div v-else style="padding: 24px">
                        <n-data-table :min-height="jobTableHeight" :max-height="jobTableHeight" :columns="jobColumns"
                            :data="jobs" bordered :loading="dataTableLoading" :scroll-x="1200">
                            <template #empty>
                                <n-result :title="t.APP.Job.Text_NResult_404_title"
                                    :description="t.APP.Job.Text_NResult_404_description">
                                    <template #icon>
                                        <n-icon :size="96">
                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 1024 1024">
                                                <path
                                                    d="M885.2 446.3l-.2-.8l-112.2-285.1c-5-16.1-19.9-27.2-36.8-27.2H281.2c-17 0-32.1 11.3-36.9 27.6L139.4 443l-.3.7l-.2.8c-1.3 4.9-1.7 9.9-1 14.8c-.1 1.6-.2 3.2-.2 4.8V830a60.9 60.9 0 0 0 60.8 60.8h627.2c33.5 0 60.8-27.3 60.9-60.8V464.1c0-1.3 0-2.6-.1-3.7c.4-4.9 0-9.6-1.3-14.1zm-295.8-43l-.3 15.7c-.8 44.9-31.8 75.1-77.1 75.1c-22.1 0-41.1-7.1-54.8-20.6S436 441.2 435.6 419l-.3-15.7H229.5L309 210h399.2l81.7 193.3H589.4zm-375 76.8h157.3c24.3 57.1 76 90.8 140.4 90.8c33.7 0 65-9.4 90.3-27.2c22.2-15.6 39.5-37.4 50.7-63.6h156.5V814H214.4V480.1z"
                                                    fill="currentColor"></path>
                                            </svg>
                                        </n-icon>
                                    </template>
                                    <template #footer>
                                        <n-button type="primary" @click="openJobModal('create')">
                                            <template #icon>
                                                <svg xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                                                    <path fill="none" stroke="currentColor" stroke-linecap="square"
                                                        stroke-linejoin="round" stroke-width="32" d="M256 112v288">
                                                    </path>
                                                    <path fill="none" stroke="currentColor" stroke-linecap="square"
                                                        stroke-linejoin="round" stroke-width="32" d="M400 256H112">
                                                    </path>
                                                </svg>
                                            </template>
                                            {{ t.APP.Text_NButton_PostAJob }}
                                        </n-button>
                                    </template>
                                </n-result>
                            </template>
                        </n-data-table>
                    </div>
                </div>
                <n-flex v-else :justify="'center'" :align="'center'" style="height: 100%; margin-top: -48px">
                    <n-result status="404" :title="t.APP.Text_NResult_404_title"
                        :description="t.APP.Text_NResult_404_description">
                        <template #footer>
                            <n-button :size="'large'" @click="openCompanyModal('create')" type="primary">
                                <template #icon>
                                    <n-icon>
                                        <svg xmlns="http://www.w3.org/2000/svg"
                                            xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">
                                            <path d="M17 15h2v2h-2zm0-4h2v2h-2zm0-4h2v2h-2zm-3.26 0l1.26.84V7z"
                                                fill="currentColor"></path>
                                            <path d="M10 3v1.51l2 1.33V5h9v14h-4v2h6V3z" fill="currentColor"></path>
                                            <path
                                                d="M8.17 5.7L15 10.25V21H1V10.48L8.17 5.7zM10 19h3v-7.84L8.17 8.09L3 11.38V19h3v-6h4v6z"
                                                fill="currentColor"></path>
                                        </svg>
                                    </n-icon>
                                </template>
                                {{ t.APP.Text_NResult_404_NButton }}
                            </n-button>
                        </template>
                    </n-result>
                </n-flex>
            </n-layout-content>
        </n-layout>
        <n-drawer :auto-focus="false" v-model:show="mobileMenuActive" :width="'80vw'" :placement="'right'">
            <n-drawer-content title="Menu" closable>
                <n-flex vertical>
                    <n-button v-if="currentCompany" type="primary" @click="openJobModal('create')">
                        <template #icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 512 512">
                                <path fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round"
                                    stroke-width="32" d="M256 112v288"></path>
                                <path fill="none" stroke="currentColor" stroke-linecap="square" stroke-linejoin="round"
                                    stroke-width="32" d="M400 256H112"></path>
                            </svg>
                        </template>
                        {{ t.APP.Text_NButton_PostAJob }}
                    </n-button>
                    <n-dropdown :show="showCompanyDropdown" v-if="currentCompany" :options="companyOptions"
                        @select="handleCompanyOptionsSelect" :render-icon="renderCompanyDropdownIcon"
                        @clickoutside="handleCompanyDropdownClickoutside">
                        <n-button size="large" quaternary @click="handleClickCompanyDropdown" :loading="loading">
                            {{ currentCompany.name }}
                        </n-button>
                    </n-dropdown>
                    <n-dropdown trigger="click" :options="languageOptions" @select="handleSelectLanguage">
                        <n-button :size="'large'" quaternary>
                            <template #icon>
                                <n-icon :size="24">
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                        viewBox="0 0 512 512">
                                        <path fill="none" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="32" d="M48 112h288">
                                        </path>
                                        <path fill="none" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="32" d="M192 64v48"></path>
                                        <path fill="none" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="32" d="M272 448l96-224l96 224"></path>
                                        <path fill="none" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="32" d="M301.5 384h133">
                                        </path>
                                        <path d="M281.3 112S257 206 199 277S80 384 80 384" fill="none"
                                            stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                            stroke-width="32"></path>
                                        <path d="M256 336s-35-27-72-75s-56-85-56-85" fill="none" stroke="currentColor"
                                            stroke-linecap="round" stroke-linejoin="round" stroke-width="32"></path>
                                    </svg>
                                </n-icon>
                            </template>
                            languages
                        </n-button>
                    </n-dropdown>
                    <n-dropdown trigger="click" :options="settingOptions" @select="handleUserOptionsSelect">
                        <n-button size="large" quaternary>
                            <template #icon>
                                <n-icon>
                                    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                        viewBox="0 0 512 512">
                                        <path
                                            d="M262.29 192.31a64 64 0 1 0 57.4 57.4a64.13 64.13 0 0 0-57.4-57.4zM416.39 256a154.34 154.34 0 0 1-1.53 20.79l45.21 35.46a10.81 10.81 0 0 1 2.45 13.75l-42.77 74a10.81 10.81 0 0 1-13.14 4.59l-44.9-18.08a16.11 16.11 0 0 0-15.17 1.75A164.48 164.48 0 0 1 325 400.8a15.94 15.94 0 0 0-8.82 12.14l-6.73 47.89a11.08 11.08 0 0 1-10.68 9.17h-85.54a11.11 11.11 0 0 1-10.69-8.87l-6.72-47.82a16.07 16.07 0 0 0-9-12.22a155.3 155.3 0 0 1-21.46-12.57a16 16 0 0 0-15.11-1.71l-44.89 18.07a10.81 10.81 0 0 1-13.14-4.58l-42.77-74a10.8 10.8 0 0 1 2.45-13.75l38.21-30a16.05 16.05 0 0 0 6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16 16 0 0 0-6.07-13.94l-38.19-30A10.81 10.81 0 0 1 49.48 186l42.77-74a10.81 10.81 0 0 1 13.14-4.59l44.9 18.08a16.11 16.11 0 0 0 15.17-1.75A164.48 164.48 0 0 1 187 111.2a15.94 15.94 0 0 0 8.82-12.14l6.73-47.89A11.08 11.08 0 0 1 213.23 42h85.54a11.11 11.11 0 0 1 10.69 8.87l6.72 47.82a16.07 16.07 0 0 0 9 12.22a155.3 155.3 0 0 1 21.46 12.57a16 16 0 0 0 15.11 1.71l44.89-18.07a10.81 10.81 0 0 1 13.14 4.58l42.77 74a10.8 10.8 0 0 1-2.45 13.75l-38.21 30a16.05 16.05 0 0 0-6.05 14.08c.33 4.14.55 8.3.55 12.47z"
                                            fill="none" stroke="currentColor" stroke-linecap="round"
                                            stroke-linejoin="round" stroke-width="32"></path>
                                    </svg>
                                </n-icon>
                            </template>
                            Settings
                        </n-button>
                    </n-dropdown>
                </n-flex>
            </n-drawer-content>
        </n-drawer>
        <n-modal v-model:show="showJobModal"
            style="max-width: calc(100vw - 24px); width: 600px; max-height: calc(100vh - 24px)" preset="card"
            size="huge" :bordered="false" :auto-focus="false" :mask-closable="false">
            <template #header>
                <div v-if="modalMode === 0">{{ t.APP.Job.NModal_title_create + currentCompany.name }}</div>
                <div v-else-if="modalMode === 1">
                    {{ t.APP.Job.NModal_title_edit_part1 + currentJob.position.toLowerCase() }}
                </div>
                <div v-else-if="modalMode === 2">
                    {{ currentJob.position }}
                </div>
            </template>
            <n-form ref="jobFormRef" :model="jobModel" :rules="jobRules" :label-placement="isMobile ? 'top' : 'left'"
                label-width="auto" require-mark-placement="right-hanging">
                <n-form-item :label="t.APP.Job.NFormItem_position_label" path="position">
                    <n-input v-model:value="jobModel.position" :size="'large'" placeholder="" maxlength="60"
                        show-count></n-input>
                </n-form-item>
                <n-form-item :label="t.APP.Job.NFormItem_description_label" path="description">
                    <n-input v-model:value="jobModel.description" type="textarea" :size="'large'" placeholder=""
                        maxlength="4000" show-count></n-input>
                </n-form-item>
                <n-form-item :label="t.APP.Job.NFormItem_Pay_label" path="pay">
                    <n-input v-model:value="jobModel.pay" :size="'large'" placeholder="" maxlength="200"
                        show-count></n-input>
                </n-form-item>
                <n-form-item :label="t.APP.Job.NFormItem_skillsRequired_label" path="skills">
                    <n-input v-model:value="jobModel.skills" :size="'large'" placeholder="" maxlength="400"
                        show-count></n-input>
                </n-form-item>
                <n-form-item :label="t.APP.Job.NFormItem_workingLocation_label" path="workingLocation">
                    <n-input v-model:value="jobModel.workingLocation" :size="'large'" placeholder="" maxlength="200"
                        show-count></n-input>
                </n-form-item>
                <n-form-item :label="t.APP.Job.NFormItem_workingHours_label" path="workingHours">
                    <n-input v-model:value="jobModel.workingHours" :size="'large'" placeholder="" maxlength="200"
                        show-count></n-input>
                </n-form-item>
            </n-form>
            <n-flex :justify="'center'">
                <n-button @click="handleCreateOrUpdateJob" :loading="loading" :size="'large'" type="primary"
                    style="width: 100%">
                    {{ modalMode ? t.APP.Company.NModal_NButton_edit : t.APP.Company.NModal_NButton_create }}
                </n-button>
            </n-flex>
        </n-modal>
        <n-modal v-model:show="showApplicantsModal" style="width: calc(100vw - 24px); height: calc(100vh - 24px)"
            preset="card" size="huge" content-style="padding: 0" :bordered="false" :auto-focus="false"
            @after-leave="closeApplicantsModal">
            <template #header>
                <div style="font-size: 24px">
                    <b>{{ `${applicantRecords.length} applicants for ${currentJob.position}` }}</b>
                </div>
            </template>
            <n-flex v-if="isMobile" vertical>
                <n-scrollbar style="max-height: calc(100vh - 24px - 48px - 50px - 39px);">
                    <div style="padding: 0 40px">
                        <n-flex vertical>
                            <n-card v-for="record in applicantRecords">
                                <n-thing class="things">
                                    <template #avatar>
                                        <n-image :src="record.Applicant.photoUrl"></n-image>
                                    </template>
                                    <template #header>
                                        <b>{{ `${record.Applicant.firstName + ' ' + record.Applicant.lastName}` }}</b>
                                    </template>
                                    <template #description>
                                        <div><n-time :time="new Date(record.Applicant.createdAt)"></n-time> applied
                                        </div>
                                    </template>
                                    <n-flex vertical :size="18" style="margin-bottom: 24px">
                                        <n-grid>
                                            <n-gi :span="12">
                                                <n-flex vertical>
                                                    <b>{{ t.Applicant.NModal_age }}</b>
                                                    <n-text>{{ record.Applicant.age }}</n-text>
                                                </n-flex>
                                            </n-gi>
                                            <n-gi :span="12">
                                                <n-flex vertical>
                                                    <b>{{ t.Applicant.NModal_education }}</b>
                                                    <n-text>{{ matchEduction(record.Applicant.education) }}</n-text>
                                                </n-flex>
                                            </n-gi>
                                        </n-grid>
                                        <n-flex vertical>
                                            <b>{{ t.Applicant.NModal_experience }}</b>
                                            <n-text>{{ record.Applicant.experience }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.Applicant.NModal_skills }}</b>
                                            <n-text>{{ record.Applicant.skill }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <n-flex :align="'center'">
                                                <b>{{ t.Applicant.NDataTable_columns_8_NButton3 }}</b>
                                                <n-button text @click="mobileHandleComment(record)">
                                                    <template #icon>
                                                        <n-icon>
                                                            <svg xmlns="http://www.w3.org/2000/svg"
                                                                xmlns:xlink="http://www.w3.org/1999/xlink"
                                                                viewBox="0 0 24 24">
                                                                <g fill="none" stroke="currentColor" stroke-width="2"
                                                                    stroke-linecap="round" stroke-linejoin="round">
                                                                    <path
                                                                        d="M9 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-3">
                                                                    </path>
                                                                    <path d="M9 15h3l8.5-8.5a1.5 1.5 0 0 0-3-3L9 12v3">
                                                                    </path>
                                                                    <path d="M16 5l3 3"></path>
                                                                </g>
                                                            </svg>
                                                        </n-icon>
                                                    </template>
                                                </n-button>
                                            </n-flex>
                                            <n-flex v-if="modalMode == 1" vertical>
                                                <n-input type="textarea" placeholder="Comment here..." maxlength="2000"
                                                    show-count v-model:value="comment"></n-input>
                                                <n-button type="primary" secondary :loading="loading"
                                                    @click="handleUpdateRecord(record, record.status, comment)">
                                                    {{ t.Applicant.NModal_saveComment }}
                                                </n-button>
                                            </n-flex>
                                            <div v-else>
                                                {{ record.comment ? record.comment : 'No any comments.' }}
                                            </div>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.Applicant.NModal_phoneNumber }}</b>
                                            <n-button tertiary tag="a" :href="`tel:${record.Applicant.telephone}`">
                                                <template #icon>
                                                    <n-icon>
                                                        <svg xmlns="http://www.w3.org/2000/svg"
                                                            xmlns:xlink="http://www.w3.org/1999/xlink"
                                                            viewBox="0 0 512 512">
                                                            <path
                                                                d="M451 374c-15.88-16-54.34-39.35-73-48.76c-24.3-12.24-26.3-13.24-45.4.95c-12.74 9.47-21.21 17.93-36.12 14.75s-47.31-21.11-75.68-49.39s-47.34-61.62-50.53-76.48s5.41-23.23 14.79-36c13.22-18 12.22-21 .92-45.3c-8.81-18.9-32.84-57-48.9-72.8C119.9 44 119.9 47 108.83 51.6A160.15 160.15 0 0 0 83 65.37C67 76 58.12 84.83 51.91 98.1s-9 44.38 23.07 102.64s54.57 88.05 101.14 134.49S258.5 406.64 310.85 436c64.76 36.27 89.6 29.2 102.91 23s22.18-15 32.83-31a159.09 159.09 0 0 0 13.8-25.8C465 391.17 468 391.17 451 374z"
                                                                fill="none" stroke="currentColor" stroke-miterlimit="10"
                                                                stroke-width="32"></path>
                                                        </svg>
                                                    </n-icon>
                                                </template>
                                                {{ record.Applicant.telephone }}
                                            </n-button>
                                        </n-flex>
                                    </n-flex>
                                    <template #action>
                                        <n-grid :x-gap="12">
                                            <n-gi v-if="record.status != 0" :span="12">
                                                <n-flex>
                                                    <n-button @click="handleUpdateRecord(record, 2, record.comment)"
                                                        type="success" style="width: 100%"
                                                        :secondary="record.status != 2" :disabled="record.status == 2">
                                                        {{ record.status == 2 ?
                                                            t.Applicant.NDataTable_columns_9_NButton1 :
                                                            t.Applicant.NDataTable_columns_9_NButton2 }}
                                                    </n-button>
                                                </n-flex>
                                            </n-gi>
                                            <n-gi v-if="record.status != 2" :span="12">
                                                <n-flex>
                                                    <n-button @click="handleUpdateRecord(record, 0, record.comment)"
                                                        type="error" :secondary="record.status != 0" style="width: 100%"
                                                        :disabled="record.status == 0">
                                                        {{ record.status == 0 ?
                                                            t.Applicant.NDataTable_columns_9_NButton3 :
                                                            t.Applicant.NDataTable_columns_9_NButton4 }}
                                                    </n-button>
                                                </n-flex>
                                            </n-gi>
                                            <n-gi v-if="record.status != 1" :span="12">
                                                <n-flex>
                                                    <n-button @click="handleUpdateRecord(record, 1, record.comment)"
                                                        tertiary style="width: 100%">
                                                        {{ t.Applicant.NDataTable_columns_9_NButton5 }}
                                                    </n-button>
                                                </n-flex>
                                            </n-gi>
                                        </n-grid>
                                    </template>
                                </n-thing>
                            </n-card>
                        </n-flex>
                        <n-flex :justify="'center'" style="margin: 12px 0">
                            <n-text style="font-size: 10px" :depth="3">
                                {{ `${applicantRecords.length} applicants for ${currentJob.position}` }}
                            </n-text>
                        </n-flex>
                    </div>
                </n-scrollbar>
            </n-flex>
            <div v-else style="padding: 0 40px">
                <n-data-table :loading="dataTableLoading" max-height="calc(100vh - 24px - 48px - 58px - 39px - 40px)"
                    :columns="applicantColumns" :data="applicantRecords" bordered :scroll-x="1800"></n-data-table>
            </div>
        </n-modal>
        <n-modal v-model:show="showApplicantDetailModal" :maskClosable="!loading">
            <n-card style="width: 800px" :bordered="false" size="huge" role="dialog" aria-modal="true">
                <template #header>
                    <div style="font-size: 24px">
                        {{ `${currentApplicant.firstName + ' ' + currentApplicant.lastName} for
                        ${currentJob.position}` }}
                    </div>
                </template>
                <n-grid :x-gap="24">
                    <n-gi :span="16">
                        <n-flex vertical :size="16">
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_name }}</n-gi>
                                <n-gi :span="16">
                                    {{ currentApplicant.firstName + ' ' + currentApplicant.lastName }}
                                </n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_applicationTime }}</n-gi>
                                <n-gi :span="16">
                                    <n-time :time="new Date(currentRecord.createdAt)" />
                                </n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_age }}</n-gi>
                                <n-gi :span="16">{{ currentApplicant.age }}</n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_education }}</n-gi>
                                <n-gi :span="16">{{ matchEduction(currentApplicant.education) }}</n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_experience }}</n-gi>
                                <n-gi :span="16">{{ currentApplicant.experience }}</n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_skills }}</n-gi>
                                <n-gi :span="16">{{ currentApplicant.skill }}</n-gi>
                            </n-grid>
                            <n-grid :x-gap="24">
                                <n-gi :span="8">{{ t.Applicant.NModal_phoneNumber }}</n-gi>
                                <n-gi :span="16">
                                    <n-flex :align="'center'" :size="4">
                                        <n-text>{{ currentApplicant.telephone }}</n-text>
                                        <n-button v-if="!copied" text size="small" @click="copyPhone">
                                            <template #icon>
                                                <n-icon>
                                                    <svg xmlns="http://www.w3.org/2000/svg"
                                                        xmlns:xlink="http://www.w3.org/1999/xlink"
                                                        viewBox="0 0 512 512">
                                                        <rect x="128" y="128" width="336" height="336" rx="57" ry="57"
                                                            fill="none" stroke="currentColor" stroke-linejoin="round"
                                                            stroke-width="32"></rect>
                                                        <path
                                                            d="M383.5 128l.5-24a56.16 56.16 0 0 0-56-56H112a64.19 64.19 0 0 0-64 64v216a56.16 56.16 0 0 0 56 56h24"
                                                            fill="none" stroke="currentColor" stroke-linecap="round"
                                                            stroke-linejoin="round" stroke-width="32"></path>
                                                    </svg>
                                                </n-icon>
                                            </template>
                                        </n-button>
                                        <n-flex v-else :size="4" :align="'center'">
                                            <n-text :depth="3">{{ t.Applicant.NModal_copied }}</n-text>
                                            <n-icon><svg xmlns="http://www.w3.org/2000/svg"
                                                    xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512">
                                                    <path fill="none" stroke="currentColor" stroke-linecap="round"
                                                        stroke-linejoin="round" stroke-width="32"
                                                        d="M416 128L192 384l-96-96">
                                                    </path>
                                                </svg></n-icon>
                                        </n-flex>
                                    </n-flex>
                                </n-gi>
                            </n-grid>
                        </n-flex>
                    </n-gi>
                    <n-gi :span="8">
                        <n-image :src="currentApplicant.photoUrl"></n-image>
                    </n-gi>
                </n-grid>
                <div v-if="commentMode">
                    <n-input type="textarea" placeholder="Comment here..." maxlength="2000" show-count
                        style="margin-top: 24px" v-model:value="comment" :disabled="loading"></n-input>
                    <n-flex :justify="'end'" style="margin-top: 48px">
                        <n-button type="primary" :loading="loading"
                            @click="handleUpdateRecord(currentRecord, currentRecord.status, comment)">
                            {{ t.Applicant.NModal_saveComment }}
                        </n-button>
                    </n-flex>
                </div>
            </n-card>
        </n-modal>
        <n-modal v-model:show="showCompanyModal"
            style="max-width: calc(100vw - 24px); width: 640px; max-height: calc(100vh - 24px)" preset="card"
            size="huge" :bordered="false" :auto-focus="false" :mask-closable="false">
            <template #header>
                <div v-if="modalMode === 0">{{ t.APP.Company.NModal_title_create }}</div>
                <div v-else-if="modalMode === 1">
                    {{ t.APP.Company.NModal_title_edit_part1 + currentCompany.name +
                        t.APP.Company.NModal_title_edit_part2 }}
                </div>
                <div v-else-if="modalMode === 2">
                    {{ currentCompany.name }}
                </div>
            </template>
            <n-flex vertical>
                <n-form ref="companyFormRef" :model="companyModel" :rules="companyRules" label-placement="left"
                    label-width="auto" require-mark-placement="right-hanging">
                    <n-form-item :label="t.SignUp.Step2.FormItem_CompanyName" path="name">
                        <n-input :size="'large'" placeholder="" v-model:value="companyModel.name" maxlength="60"
                            show-count></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_CompanyAddress" path="address">
                        <n-input :size="'large'" placeholder="" v-model:value="companyModel.address" maxlength="120"
                            show-count></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_CompanyDescription" path="description">
                        <n-input type="textarea" :size="'large'" placeholder="" v-model:value="companyModel.description"
                            maxlength="4000" show-count></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_ContactName" path="contactName">
                        <n-input :size="'large'" placeholder="" v-model:value="companyModel.contactName"
                            maxlength="60"></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_ContactPhone" path="contactPhone">
                        <n-input :size="'large'" placeholder="" v-model:value="companyModel.contactPhone"
                            maxlength="60"></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_CompanyEmail" path="email">
                        <n-input :size="'large'" placeholder="" v-model:value="companyModel.email"
                            maxlength="60"></n-input>
                    </n-form-item>
                    <n-form-item :label="t.SignUp.Step2.FormItem_Logo" path="logo">
                        <n-upload ref="uploadRef" :action="baseURL + '/Siping/SA/company/upload/logo'"
                            @before-upload="beforeUpload" :max="1" show-download-button :default-file-list="fileList"
                            :data="{ logo: companyModel.logo }" :default-upload="false" list-type="image"
                            @remove="handleUploadRemove">
                            <n-button>
                                {{ t.SignUp.Step2.ButtonText_upload }}
                            </n-button>
                        </n-upload>
                    </n-form-item>
                </n-form>
                <n-flex :justify="'center'">
                    <n-button @click="handleCreateOrUpdateCompany" :loading="loading" :size="'large'" type="primary"
                        style="width: 100%">
                        {{ modalMode ? t.APP.Company.NModal_NButton_edit : t.APP.Company.NModal_NButton_create }}
                    </n-button>
                </n-flex>
            </n-flex>
        </n-modal>
        <n-modal v-model:show="showManageCompanyModal" style="width: calc(100vw - 24px); height: calc(100vh - 24px)"
            preset="card" size="huge" content-style="padding: 0" :bordered="false" :auto-focus="false"
            :closable="false">
            <template #header>
                <div v-if="isMobile">
                    <n-button @click="showManageCompanyModal = false">
                        Back
                    </n-button>
                </div>
                <n-breadcrumb v-else>
                    <n-breadcrumb-item @click="showManageCompanyModal = false">
                        {{ t.APP.NModal_NBreadCrumbItem_1 }}
                    </n-breadcrumb-item>
                    <n-breadcrumb-item>
                        <h2>{{ t.APP.Company.NModal_title_manage }}</h2>
                    </n-breadcrumb-item>
                </n-breadcrumb>
            </template>
            <template #header-extra>
                <n-button type="primary" secondary @click="openCompanyModal('create')">
                    <template #icon>
                        <n-icon>
                            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                                viewBox="0 0 512 512">
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="32" d="M256 112v288"></path>
                                <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                                    stroke-width="32" d="M400 256H112"></path>
                            </svg>
                        </n-icon>
                    </template>
                    {{ t.APP.Company.NModal_title_create }}
                </n-button>
            </template>
            <n-flex v-if="isMobile" vertical>
                <n-scrollbar style="max-height: calc(100vh - 24px - 48px - 50px - 39px);">
                    <div style="padding: 0 40px">
                        <n-flex vertical>
                            <n-card v-for="company in companies">
                                <n-thing class="things">
                                    <template #avatar>
                                        <n-avatar :src="logoFolderUrl + company.logo"></n-avatar>
                                    </template>
                                    <template #header>
                                        <b>{{ company.name }}</b>
                                    </template>
                                    <n-flex vertical :size="18" style="margin-bottom: 24px">
                                        <n-flex vertical>
                                            <b>{{ t.APP.Company.Mobile_NCard_label_1 }}</b>
                                            <n-text>{{ company.description }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Company.NDataTable_columns_2 }}</b>
                                            <n-text>{{ company.address }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Company.NDataTable_columns_3 }}</b>
                                            <n-text>{{ company.contactName }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Company.NDataTable_columns_4 }}</b>
                                            <n-text>{{ company.contactPhone }}</n-text>
                                        </n-flex>
                                        <n-flex vertical>
                                            <b>{{ t.APP.Company.NDataTable_columns_5 }}</b>
                                            <n-text>{{ company.email }}</n-text>
                                        </n-flex>
                                    </n-flex>
                                    <template #action>
                                        <n-flex>
                                            <n-button @click="viewCompanyDetail(company)" style="width: 100%">
                                                {{ t.APP.Company.NDataTable_columns_6_NButton }}
                                            </n-button>
                                        </n-flex>
                                    </template>
                                </n-thing>
                            </n-card>
                        </n-flex>
                    </div>
                </n-scrollbar>
            </n-flex>
            <div v-else style="padding: 0 40px">
                <n-data-table max-height="calc(100vh - 24px - 48px - 58px - 39px - 40px)" :data="companies"
                    :columns="companyColumns" bordered :scroll-x="1800"></n-data-table>
            </div>
        </n-modal>
    </div>
</template>

<style lang="less" scoped>
.container {
    height: 100vh;

    .header {
        padding: 24px
    }

    .content {
        height: calc(100vh - 89px)
    }
}

.n-image {
    :deep(img) {
        width: 100%;
    }
}

.things {
    .n-image {
        :deep(img) {
            width: 48px;
        }
    }
}
</style>