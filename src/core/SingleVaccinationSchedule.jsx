import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import {
  getVaccination,
  registerVaccination,
  cancelRegister,
  getCenter,
  sendVaccinationTime,
  addToHistory,
  removeFromHistory,
  updateUser,
  updateVaccinationSchedule,
} from "./apiCore";
import { isAuthenticated } from "../auth";
import { Link } from "react-router-dom";
import DeleteVaccinationSchedule from "../staff/DeleteVaccinationSchedule";
import moment from "moment";
import MarkInjected from "./MarkInjected";

export default function SingleVaccinationSchedule(props) {
  const [values, setValues] = useState({
    vaccination: {},
    load: false,
    center: {},
    sentEmail: false,
    register: false,
    error: "",
    success: false,
  });

  const { vaccination, register, error, center, load, success, sentEmail } =
    values;

  const getIndex = (array = [], id) => {
    let temp = -1;
    array.forEach((element, i) => {
      if (element["id"] === id) {
        temp = i;
      }
    });
    return temp;
  };

  const checkRegister = (participants = []) => {
    const id = isAuthenticated() && isAuthenticated().user._id;
    let match = getIndex(participants, id) !== -1;
    return match;
  };

  const loadSingleCenter = (centerId) => {
    getCenter(centerId).then((data) => {
      if (data.error) {
        setValues({ ...values, error: data.error });
      } else {
        setValues({
          ...values,
          center: data,
        });
      }
    });
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
          success: checkRegister(data.participants),
          load: true,
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

  useEffect(
    () => {
      loadSingleCenter(vaccination.ownership);
    },
    // eslint-disable-next-line
    [load]
  );

  const handleVaccineTime = (participants = [], vaccineTime) => {
    const id = isAuthenticated() && isAuthenticated().user._id;
    let temp = -1;
    participants.forEach((element, i) => {
      if (element["id"] === id) {
        temp = i;
      }
    });
    return moment(vaccineTime).add(temp * 3, "m");
  };

  const compareDate = (vaccineDate) => {
    let ms = Date.now();
    let date = new Date(vaccineDate);
    return ms > date;
  };

  const registerToggle = () => {
    let callApiRegister = !register ? registerVaccination : cancelRegister;
    const {
      user: { _id, name, histories },
      token,
    } = isAuthenticated();
    if (histories.length >= 1) {
      if (
        histories[histories.length - 1].vaccinationName !== vaccination.name
      ) {
        let tempDate = new Date(histories[histories.length - 1].created);
        let today = Date.now();
        let date = new Date(
          moment(tempDate)
            .add(histories[histories.length - 1].timeConsuming, "months")
            .format()
        );
        if (
          histories[histories.length - 1].status === false &&
          today <= date.getTime()
        ) {
          setValues({
            ...values,
            error:
              "Oop! You have registered a vaccination schedule, please cancel to register another vaccination.",
          });
          return;
        }
        if (
          histories[histories.length - 1].status === true &&
          today <= date.getTime()
        ) {
          setValues({
            ...values,
            error:
              "Oop! You have injected the vaccine. But you need time to consume it.",
          });
          return;
        }
      }
    }
    const id = _id;
    if (!register) {
      setValues({ ...values, sentEmail: false });
    } else {
      setValues({ ...values, sentEmail: true });
    }
    const {
      name: vaccinationName,
      vaccineDate,
      vaccine,
      participants,
    } = vaccination;
    const vaccineName = vaccination && vaccine.name;
    const vaccinationId = props.match.params.vaccinationId;
    callApiRegister(token, { vaccinationId, name, id, vaccineName }).then(
      (data) => {
        if (data.error) {
          console.log(data.error);
        } else {
          setValues({
            ...values,
            register: !register,
            vaccination: data,
            success: !success,
          });
        }
      }
    );

    if (callApiRegister === cancelRegister) {
      const timeConsuming = vaccine && vaccine.timeConsuming;
      const vaccinationTime = handleVaccineTime(participants, vaccineDate);
      removeFromHistory(token, {
        _id,
        vaccinationId,
        vaccineName,
        vaccinationName,
        vaccinationTime,
        timeConsuming,
      }).then((data) => {
        if (data.error) {
          console.log(data.error);
        }
        updateUser(data, () => {});
      });
    }
  };

  const getIndexHistory = (array = [], id) => {
    let temp = -1;
    array.forEach((element, i) => {
      if (element["vaccinationId"] === id) {
        temp = i;
      }
    });
    return temp;
  };

  const sendEmail = () => {
    const {
      user: { _id, name, email, histories },
      token,
    } = isAuthenticated();
    const {
      name: vaccinationName,
      vaccineDate,
      participants,
      vaccine,
      address,
    } = vaccination;
    const vaccineName = vaccine && vaccine.name;
    const timeConsuming = vaccine && vaccine.timeConsuming;

    const vaccinationTime = handleVaccineTime(participants, vaccineDate);
    const vaccinationId = props.match.params.vaccinationId;

    if (getIndex(participants, _id) !== -1) {
      if (getIndexHistory(histories, vaccinationId) < 0) {
        addToHistory(token, {
          _id,
          vaccinationId,
          vaccineName,
          vaccinationName,
          vaccinationTime,
          timeConsuming,
        }).then((data) => {
          if (data.error) {
            console.log(data.error);
          }
          // console.log(data);
          updateUser(data, () => {
            setValues({ ...values });
          });
        });
      }
    }
    if (getIndex(participants, _id) !== -1 && sentEmail === false) {
      sendVaccinationTime(
        email,
        vaccinationName,
        vaccinationTime.format("LLLL"),
        name,
        address
      ).then((data) => {
        if (data.error) {
          // console.log(data.error);
          setValues({ ...values, error: data.error });
        } else {
          setValues({ ...values, sentEmail: true });
        }
      });
    }
  };

  const informationForm = () => (
    <div className="row">
      {vaccination && (
        <>
          <div className="col-md-2">
            {isAuthenticated() &&
              isAuthenticated().user.role >= 1 &&
              isAuthenticated().user.references === vaccination.ownership && (
                <>
                  <div className="col">
                    <div className="row mb-2">
                      <Link
                        className="btn btn-raised btn-success"
                        to={`/update/vaccination/${props.match.params.vaccinationId}`}
                      >
                        Update Vaccination Schedule
                      </Link>
                    </div>
                    <div className="row">
                      <DeleteVaccinationSchedule
                        vaccinationId={vaccination._id}
                      />
                    </div>
                  </div>
                </>
              )}
            {isAuthenticated() &&
              isAuthenticated().user.role === 0 &&
              vaccination &&
              compareDate(vaccination.vaccineDate) === false && (
                <>
                  {!register ? (
                    <h5
                      onClick={registerToggle}
                      className="btn btn-raised btn-success"
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className="fa fa-check-circle text-success bg-dark"
                        style={{ padding: "10px", borderRadius: "50%" }}
                      />
                      <br />
                      Register Vaccination
                    </h5>
                  ) : (
                    <h5
                      onClick={registerToggle}
                      className="btn btn-raised btn-danger"
                      style={{ cursor: "pointer" }}
                    >
                      <i
                        className="fa fa-times-circle text-warning bg-dark"
                        style={{ padding: "10px", borderRadius: "50%" }}
                      />
                      <br />
                      Cancel Register Vaccination
                    </h5>
                  )}
                </>
              )}
          </div>
          <div className="col-5">
            <div className="card mb-5">
              <h3 className="card-header">Information</h3>
              <ul className="list-group">
                <li className="list-group-item">{vaccination.name}</li>
                <li className="list-group-item">
                  Vaccine: {vaccination.vaccine && vaccination.vaccine.name}
                </li>
                <li className="list-group-item">
                  Address: {vaccination.address}
                </li>
                <li className="list-group-item">Limit: {vaccination.limit}</li>
                <li className="list-group-item">
                  Vaccination time:{" "}
                  {moment(vaccination.vaccineDate).format("LLLL")}
                </li>
                {vaccination.ownership && (
                  <li className="list-group-item">
                    Organized By:{" "}
                    <Link
                      to={`/centers/${vaccination.ownership}`}
                      className="btn btn-raised btn-primary btn-sm"
                    >
                      {center.name}
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          </div>
          {isAuthenticated() && isAuthenticated().user.role === 1 && (
            <div className="col-sm-5">
              <div className="card mb-5">
                <h3 className="card-header">Participants</h3>
                <ol className="list-group list-group-numbered">
                  {vaccination.participants &&
                    vaccination.participants.map((p, i) => {
                      return (
                        <li key={i} className="list-group-item">
                          <div className="row">
                            <div className="col">
                              {i + 1}.
                              <Link to={`/public-profile/${p.id}`}>
                                {p.name}
                              </Link>
                            </div>
                            {isAuthenticated() &&
                            isAuthenticated().user.role === 1 ? (
                              <MarkInjected
                                status={p.status}
                                userId={p.id}
                                vaccination={vaccination}
                                getIndex={getIndex}
                                updateVaccinationSchedule={
                                  updateVaccinationSchedule
                                }
                                getIndexHistory={getIndexHistory}
                                token={isAuthenticated().token}
                                staffId={isAuthenticated().user._id}
                              />
                            ) : (
                              <div>
                                {!p.status ? (
                                  <i
                                    style={{ color: "red" }}
                                    className="fas fa-lg fa-window-close"
                                  />
                                ) : (
                                  <i
                                    style={{ color: "green" }}
                                    className="fas fa-lg fa-check-square"
                                  />
                                )}
                              </div>
                            )}
                            <div className="col">
                              {`${moment(vaccination.vaccineDate)
                                .add(i * 3, "m")
                                .calendar()}`}
                            </div>
                          </div>
                        </li>
                      );
                    })}
                </ol>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

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

  const showSuccess = () => {
    return (
      <div
        className="alert alert-info"
        style={{ display: success ? "" : "none" }}
      >
        <h2>{`You have successfully registered for vaccination! Your vaccine time is: ${handleVaccineTime(
          vaccination.participants,
          vaccination.vaccineDate
        ).calendar()}. You can check your vaccine time in your email!`}</h2>
      </div>
    );
  };

  return (
    <Layout
      title={vaccination && vaccination.name}
      description={
        (vaccination &&
          vaccination.participants &&
          vaccination.participants.length === vaccination.limit) ||
        compareDate(vaccination.vaccineDate)
          ? "Status: Unavailable"
          : "Status: Available"
      }
      className="container"
    >
      {informationForm()}
      {sendEmail()}
      {showSuccess()}
      {showError()}
      {goBack()}
    </Layout>
  );
}
