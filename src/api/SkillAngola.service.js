import http from "./http-common";
import { encryptData } from "../assets/auth";

class SkillAngolaService {
    createUser(data) {
        return http.post(`/Siping/SA/user`, data);
    }

    updateUser(uid, data) {
        return http.put(`/Siping/SA/user/${uid}`, data);
    }

    deleteUser(uid) {
        return http.delete(`/Siping/SA/user/${uid}`);
    }

    handleLogin(data) {
        return http.post(`/Siping/SA/user/login`, data);
    }

    localUser(uid) {
        return http.get(`/Siping/SA/user/${uid}`);
    }

    createCompany(data) {
        return http.post(`/Siping/SA/company`, data);
    }

    findAllCompaniesByUserUid(userUid) {
        return http.get(`/Siping/SA/company/all/${userUid}`);
    }

    updateCompany(uid, data) {
        return http.put(`/Siping/SA/company/${uid}`, data);
    }

    deleteLogo(data) {
        return http.delete(`/Siping/SA/company/upload/logo/${data}`);
    }

    createJob(companyUid, data) {
        return http.post(`/Siping/SA/job/${companyUid}`, data);
    }

    updateJob(id, data) {
        return http.put(`/Siping/SA/job/${id}`, data);
    }

    findAllJobsByOffset(data) {
        console.log(encodeURIComponent(encryptData(data)))
        return http.get(`/Siping/SA/job/all?data=${encodeURIComponent(encryptData(data))}`);
    }

    createRecord(data) {
        return http.post(`/Siping/SA/record`, data)
    }

    findAllRecordsByApplicantId(ApplicantId) {
        return http.get(`/Siping/SA/record/all/applicant/${ApplicantId}`);
    }

    findAllRecordsByJobId(jobId) {
        return http.get(`/Siping/SA/record/all/job/${jobId}`);
    }

    updateRecord(recordId, data) {
        return http.put(`/Siping/SA/record/${recordId}`, data);
    }
}

export default new SkillAngolaService();