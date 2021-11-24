import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getVaccination, registerVaccination, cancelRegister } from "./apiCore";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import DeleteVaccination from "./DeleteVaccination";

export default function Vaccination(props) {
  const [values, setValues] = useState({
    vaccination: {},
    register: false,
    redirectToSignin: false,
    error: "",
  });

  const { vaccination, register, error } = values;

  const checkRegister = (participants) => {
    const userId = isAuthenticated() && isAuthenticated().user._id;
    let match = participants.indexOf(userId) !== -1;
    return match;
  };

  const loadSingleVaccination = (vaccinationId) => {
    getVaccination(vaccinationId).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          vaccination: data,
          register: checkRegister(data.participants),
        });
      }
    });
  };

  useEffect(
    () => {
      const vaccinationId = props.match.params.vaccinationId;
      loadSingleVaccination(vaccinationId);
    },
    // eslint-disable-next-line
    []
  );

  const registerToggle = () => {
    if (!isAuthenticated()) {
      setValues({ ...values, redirectToSignin: true });
      return false;
    }
    let callApi = register ? registerVaccination : cancelRegister;
    const userId = isAuthenticated().user._id;
    const token = isAuthenticated().token;
    const vaccinationId = vaccination._id;

    callApi(userId, token, vaccinationId).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setValues({ ...values, register: !register, vaccination: data });
      }
    });
  };

  const showError = () => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  const goBack = () => (
    <div className="mt-5">
      <Link to="/" className="text-warning">
        Back to Homepage
      </Link>
    </div>
  );

  return (
    <Layout
      title={vaccination && vaccination.name}
      description={
        vaccination &&
        vaccination.participants &&
        vaccination.participants.length === vaccination.limit
          ? "Status: Full"
          : "Status: Available"
      }
      className="container-fluid"
    >
      <div className="row">
        {vaccination && (
          <>
            <div className="card col-md-3 border-secondary">
              {isAuthenticated() && isAuthenticated().user.role >= 1 && (
                <div className="card-body">
                  <h5 className="card-title text-danger">
                    Edit/Delete
                    {`${
                      isAuthenticated().user.role === 1 ? "" : "as an Admin"
                    }`}
                  </h5>
                  <Link
                    className="btn btn-raised btn-success mr-5"
                    to={`/update/vaccination/${props.match.params.vaccinationId}`}
                  >
                    Edit Vaccination Schedule
                  </Link>
                  <DeleteVaccination vaccinationId={vaccination._id} />
                </div>
              )}
              {isAuthenticated() && isAuthenticated().user.role === 0 && (
                <div className="card-body">
                  <h5 className="card-title text-danger">
                    Register/Cancel Register vaccination
                  </h5>
                  <button className="btn btn-raised btn-success mr-5">
                    Register Vaccination
                  </button>
                </div>
              )}
            </div>
            <div className="col-md-5">
              <div className="lead mt-2">
                <p>{vaccination.name}</p>
                <p>Type: {vaccination.type}</p>
                <p>Address: {vaccination.address}</p>
                <p>Limit: {vaccination.limit}</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="lead mt-2">
                <h4>Participants</h4>
                <ol className="list-group list-group-numbered">
                  <li className="list-group-item">Number 1</li>
                </ol>
              </div>
            </div>
          </>
        )}
      </div>
      {showError()}
      {goBack()}
    </Layout>
  );
}
