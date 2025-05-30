import environment from "./mode";

function setBaseURL() {
    let url = '';
    switch (environment) {
        case 'dev':
            url = 'http://localhost:5174/api';
            break;
        case 'build':
            url = 'https://www.hillib.com/api';
            break;
    }
    return url;
}

const baseURL = setBaseURL();

export default baseURL;