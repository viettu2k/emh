import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import { getCenter, getVaccinationByCenter } from "./apiCore";
import { API } from "../config";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import DeleteUser from "../admin/DeleteUser";

export default function Center(props) {
  const [center, setCenter] = useState({});
  const [vaccinations, setVaccinations] = useState([]);
  const [error, setError] = useState(false);

  const { token } = isAuthenticated();

  const loadListByCenter = (centerId) => {
    getVaccinationByCenter(centerId, token).then((data) => {
      if (data.error) {
        console.log(data.error);
      } else {
        setVaccinations(data);
      }
    });
  };

  const loadSingleCenter = (centerId) => {
    getCenter(centerId).then((data) => {
      if (data.error) {
        setError(data.error);
      } else {
        // console.log(data);
        setCenter(data);
        loadListByCenter(centerId);
      }
    });
  };

  useEffect(
    () => {
      const centerId = props.match.params.centerId;
      loadSingleCenter(centerId);
    },
    // eslint-disable-next-line
    []
  );

  const listByCenter = () => {
    return (
      <div className="card mb-5">
        <h3 className="card-header">
          Vaccination Schedule Organized by {center.name}
        </h3>
        <ul className="list-group">
          {vaccinations &&
            vaccinations.map((v, i) => {
              return (
                <li key={i} className="list-group-item list-group-item-action">
                  <Link to={`/vaccinations/${v._id}`}>{v.name}</Link>
                </li>
              );
            })}
        </ul>
      </div>
    );
  };

  const showError = () => (
    <div
      className="alert alert-danger"
      style={{ display: error ? "" : "none" }}
    >
      {error}
    </div>
  );

  return (
    <Layout
      title={center && center.name}
      description={
        center &&
        center.description &&
        // center.description.substring(0, 100).concat("...")
        center.description
      }
      className="container-fluid"
    >
      {center && (
        <>
          <div className="container">
            <div className="row">
              <div className="card col-md-4 border-secondary">
                <img
                  style={{ height: "250px", width: "auto" }}
                  className="img-fluid rounded border border-primary"
                  src={`${API}/user/photo/${center._id}`}
                  alt={center.name}
                />

                {isAuthenticated() && isAuthenticated().user.role === 3 && (
                  <div className="card-body">
                    <h5 className="card-title text-danger">
                      Edit/Delete as an Admin
                    </h5>
                    <Link
                      className="btn btn-raised btn-success mr-5"
                      to={`/edit-user/${props.match.params.centerId}`}
                    >
                      Edit Center
                    </Link>
                    <DeleteUser userId={center._id} />
                  </div>
                )}
              </div>
              <div className="col-md-5">
                <div className="lead mt-2">
                  <p>{center.name}</p>
                  <p>{center.description}</p>
                  <p>Address: {center.address}</p>
                  <p>Hotline: {center.phoneNumber}</p>
                </div>
              </div>
            </div>
            <hr />
            {listByCenter()}
          </div>
        </>
      )}
      {showError()}
    </Layout>
  );
}
