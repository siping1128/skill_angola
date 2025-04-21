import { ref } from 'vue';
import SkillAngolaService from '../api/SkillAngola.service';
import router from '../router/router';
import CryptoJS from 'crypto-js';

const exist = ref(false);

async function localUser() {
    const uid = localStorage.getItem('SAToken')
    if (uid) {
        await SkillAngolaService.localUser(uid).then(async function (val) {
            const code = val.data.code;
            if (code == 201) {
                exist.value = true;
            } else {
                exist.value = false;
                logout()
            }
        })
    }
    return exist.value
}

function logout() {
    localStorage.removeItem('SAToken');
    localStorage.removeItem('SACURC');
    router.go(0)
}

function encryptData(data) {
    const encryptedData = CryptoJS.AES.encrypt(JSON.stringify(data), import.meta.env.VITE_SIPINGSAAPP).toString();
    return encryptedData.replaceAll("/", "$");
}

function decryptData(encryptedData) {
    encryptedData = encryptedData.replaceAll("$", "/");
    const bytes = CryptoJS.AES.decrypt(encryptedData, import.meta.env.VITE_SIPINGSAAPP);
    const decryptedData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptedData;
}


export { localUser, logout }

export { encryptData, decryptData }