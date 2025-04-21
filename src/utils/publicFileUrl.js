import environment from "./mode";

function setFileURL() {
    const url = environment === 'dev' ? '/localFiles/' : 'https://file.scholarhills.com/';
    return url;
}

const fileURL = setFileURL();

export default fileURL;