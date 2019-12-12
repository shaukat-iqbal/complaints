import React, { useEffect } from "react";
import PropTypes from "prop-types";
import { makeStyles, withStyles } from "@material-ui/core/styles";
import clsx from "clsx";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Check from "@material-ui/icons/Check";
import SettingsIcon from "@material-ui/icons/Settings";
import StepConnector from "@material-ui/core/StepConnector";
import Members from "../admin/Higher Authorities/Members";
import AdminForm from "../common/adminForm";
import Features from "../admin/Configuration/Features";
import Attachments from "../admin/Attachments/Attachments";
import CompanyDetailsForm from "../common/companyDetailsForm";
import "./stepper.css";
import { Link } from "react-router-dom";
import {
  Details,
  PersonAdd,
  FormatListBulleted,
  Work,
  SupervisedUserCircleRounded,
  Attachment
} from "@material-ui/icons";
import { DialogTitle, Grow, Button } from "@material-ui/core";

import CategoriesRenderer from "../../categories/CategoriesRenderer";
import { getConfiguration } from "../../services/configurationService";
import Registration from "../admin/usersManagement/Registration";
import LocationRenderer from "../Locations/LocationRenderer";

const useQontoStepIconStyles = makeStyles({
  root: {
    color: "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center"
  },
  active: {
    color: "#784af4"
  },
  circle: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    backgroundColor: "currentColor"
  },
  completed: {
    color: "#784af4",
    zIndex: 1,
    fontSize: 18
  }
});

function QontoStepIcon(props) {
  const classes = useQontoStepIconStyles();
  const { active, completed } = props;

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active
      })}
    >
      {completed ? (
        <Check className={classes.completed} />
      ) : (
        <div className={classes.circle} />
      )}
    </div>
  );
}

QontoStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool
};

const ColorlibConnector = withStyles({
  alternativeLabel: {
    top: 22
  },
  active: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
    }
  },
  completed: {
    "& $line": {
      backgroundImage:
        "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)"
    }
  },
  line: {
    height: 3,
    border: 0,
    backgroundColor: "#eaeaf0",
    borderRadius: 1
  }
})(StepConnector);

const useColorlibStepIconStyles = makeStyles({
  root: {
    backgroundColor: "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 40,
    height: 40,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center"
  },
  active: {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)"
  },
  completed: {
    backgroundImage:
      "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)"
  }
});

function ColorlibStepIcon(props) {
  const classes = useColorlibStepIconStyles();
  const { active, completed } = props;

  const icons = {
    1: <Details />,
    2: <PersonAdd />,
    3: <SettingsIcon />,
    4: <FormatListBulleted />,
    5: <Attachment />,
    6: <Work />,
    7: <SupervisedUserCircleRounded />
  };

  return (
    <div
      className={clsx(classes.root, {
        [classes.active]: active,
        [classes.completed]: completed
      })}
    >
      {icons[String(props.icon)]}
    </div>
  );
}

ColorlibStepIcon.propTypes = {
  active: PropTypes.bool,
  completed: PropTypes.bool,
  icon: PropTypes.node
};

const useStyles = makeStyles(theme => ({
  root: {
    width: "90%"
  },
  button: {
    marginRight: theme.spacing(1)
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1)
  }
}));

function getSteps() {
  return [
    "Company Details",
    "Admin Account",
    "Features",
    "Categories",
    "Location Tags",
    "Allowed Attachments",
    "Higher Authority Members",
    "Users registration"
  ];
}

function getStepContent(step, enableNext, props) {
  switch (step) {
    case 0:
      return (
        <div className=" d-flex justify-content-center align-items-center">
          <CompanyDetailsForm
            enableNext={enableNext}
            {...props}
            isEditView={true}
          />
        </div>
      );
    case 1:
      return (
        <div className=" d-flex justify-content-center align-items-center">
          <AdminForm
            isStepper={true}
            enableNext={enableNext}
            companyId={props.match.params.id}
          />
        </div>
      );
    case 2:
      return (
        <Features
          isStepper={true}
          enableNext={enableNext}
          companyId={props.match.params.id}
        />
      );
    case 3:
      return <CategoriesRenderer enableNext={enableNext} isStepper={true} />;
    case 4:
      return <LocationRenderer enableNext={enableNext} isStepper={true} />;
    case 5:
      return <Attachments enableNext={enableNext} />;
    case 6:
      return <Members enableNext={enableNext} />;
    case 7:
      return <Registration isStepper={true} />;
    default:
      return "Unknown step";
  }
}

export default function CustomizedSteppers(props) {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);
  const [isNextEnabled, setIsNextEnabled] = React.useState(false);
  const steps = getSteps();

  function enableNext() {
    setActiveStep(pre => pre + 1);
    // setIsNextEnabled(true);
  }

  function handleSkip() {
    setActiveStep(prevActiveStep => prevActiveStep + 1);
  }

  // function handleNext() {
  //   setActiveStep(prevActiveStep => prevActiveStep + 1);

  //   setIsNextEnabled(false);
  // }

  // function handleBack() {
  //   setActiveStep(prevActiveStep => prevActiveStep - 1);
  // }

  // useEffect(async () => {
  //   try {
  //     await getConfiguration();
  //     window.location = "/login";
  //   } catch (error) {}
  // }, []);

  return (
    <div className={classes.root}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {steps.map(label => (
          <Step key={label}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      <div>
        {activeStep === steps.length ? (
          <div>
            <div className={classes.instructions}>
              <h4>Congratulations</h4>
              <p>
                You are good to go. Now you may login to your account and use
                our product.{" "}
              </p>
            </div>
            <Link to={"/login"}>Go to Login</Link>
          </div>
        ) : (
          <div>
            <div className={classes.instructions}>
              {getStepContent(activeStep, enableNext, props)}
            </div>
            <div className="mt-3">
              {activeStep === 6 && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSkip}
                  className={classes.button}
                >
                  Skip
                </Button>
              )}
            </div>
            {/* <div className="mt-3">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                className={classes.button}
              >
                Back
              </Button>

              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  Finish
                </Button>
              ) : (
                <>
                  {" "}
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleNext}
                    className={classes.button}
                    disabled={!isNextEnabled}
                  >
                    Next
                  </Button>
                  {activeStep === 2 ||
                    (activeStep === 6 && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSkip}
                        className={classes.button}
                        disabled={!isNextEnabled}
                      >
                        Skip
                      </Button>
                    ))}
                </>
              )}
            </div>
          */}
          </div>
        )}
      </div>
    </div>
  );
}
