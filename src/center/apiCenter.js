import { API } from "../config";

export const read = (userId, token) => {
    return fetch(`${API}/user/${userId}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const createStaff = (userId, token, staff) => {
    return fetch(`${API}/staff/${userId}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: staff,
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => {
            console.log(err);
        });
};

export const addMember = (userId, token, staff) => {
    return fetch(`${API}/add-member/${userId}`, {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(staff),
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.error(err));
};

export const getVaccinesByCenter = (userId, token) => {
    return fetch(`${API}/vaccines/by/${userId}`, {
            method: "GET",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const createVaccine = (userId, token, vaccine) => {
    return fetch(`${API}/vaccines/${userId}`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(vaccine),
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => {
            console.log(err);
        });
};

export const getVaccine = (vaccineId) => {
    return fetch(`${API}/vaccines/${vaccineId}`, {
            method: "GET",
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const updateVaccine = (vaccineId, userId, token, vaccine) => {
    return fetch(`${API}/vaccines/${vaccineId}/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(vaccine),
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => {
            console.log(err);
        });
};

export const removeVaccine = (vaccineId, userId, token) => {
    return fetch(`${API}/vaccines/${vaccineId}/${userId}`, {
            method: "DELETE",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.error(err));
};

export const updateUser = (user, next) => {
    if (typeof window !== "undefined") {
        if (localStorage.getItem("jwt")) {
            let auth = JSON.parse(localStorage.getItem("jwt"));
            auth.user = user;
            localStorage.setItem("jwt", JSON.stringify(auth));
            next();
        }
    }
};

export const getVaccinationByCenter = (centerId) => {
    return fetch(`${API}/vaccinations/center/${centerId}`, {
            method: "GET",
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};

export const getParticipantsByCenter = (centerId) => {
    return fetch(`${API}/vaccinations/center/participants/${centerId}`, {
            method: "GET",
        })
        .then((response) => {
            return response.json();
        })
        .catch((err) => console.log(err));
};