import { readJSON } from '../api/handleJson'
import store from '../store/store'

export const languageOptions = [
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

export async function handleSelectLanguage(lang) {
    localStorage.setItem("lang", lang)
    await readJSON(`language/${lang}`).then(res => {
        store.state.display.text = res.data
    })
}