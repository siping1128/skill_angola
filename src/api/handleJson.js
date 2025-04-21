import axios from "axios";

export function readJSON(path) {
    return axios('./skill_angola/json/' + path + '.json')
}